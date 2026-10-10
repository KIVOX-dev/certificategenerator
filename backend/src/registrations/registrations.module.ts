import { Controller, Delete, Get, Injectable, Module, Param, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, isValidObjectId, Model, Types } from 'mongoose';
import { AdminGuard } from '../auth/admin.guard';
import { AppException } from '../common/app.exception';
import { escapeRegex } from '../common/ids';
import { Certificate, Event, Registration } from '../database/schemas';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name) private regs: Model<Registration>,
    @InjectModel(Certificate.name) private certs: Model<Certificate>,
    @InjectModel(Event.name) private events: Model<Event>,
  ) {}

  async list(q: string | undefined, eventId: string | undefined, page: number, limit: number) {
    const filter: FilterQuery<Registration> = {};
    if (eventId && isValidObjectId(eventId)) filter.eventId = new Types.ObjectId(eventId) as any;
    if (q?.trim()) {
      const t = q.trim();
      const digits = t.replace(/\D/g, '');
      filter.$or = [{ fullName: new RegExp(escapeRegex(t), 'i') }];
      if (digits.length >= 4) filter.$or.push({ normalizedPhone: new RegExp(escapeRegex(digits.slice(-10)) + '$') });
    }
    const [rows, total] = await Promise.all([
      this.regs.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.regs.countDocuments(filter),
    ]);
    const [certs, events] = await Promise.all([
      this.certs.find({ registrationId: { $in: rows.map((r) => r._id) } }).sort({ createdAt: -1 }),
      this.events.find({ _id: { $in: rows.map((r) => r.eventId) } }),
    ]);
    const certBy = new Map<string, (typeof certs)[number]>();
    for (const c of certs) if (!certBy.has(String(c.registrationId))) certBy.set(String(c.registrationId), c);
    const evBy = new Map(events.map((e) => [String(e._id), e]));
    return {
      total, page, limit,
      items: rows.map((r) => {
        const c = certBy.get(String(r._id));
        return {
          id: String(r._id),
          fullName: r.fullName,
          phone: r.normalizedPhone, // admin-only endpoint
          eventId: String(r.eventId),
          eventName: evBy.get(String(r.eventId))?.name ?? '',
          certificateId: c ? String(c._id) : null,
          certificateNumber: c?.certificateNumber ?? null,
          certificateStatus: c?.status ?? null,
          createdAt: r.createdAt,
        };
      }),
    };
  }

  /** Revokes any certificates and removes the registration so the phone can register again. */
  async remove(id: string) {
    const reg = isValidObjectId(id) ? await this.regs.findById(id) : null;
    if (!reg) throw new AppException('NOT_FOUND', 'Registration not found.', 404);
    await this.certs.updateMany({ registrationId: reg._id }, { status: 'REVOKED', revokedAt: new Date() });
    await reg.deleteOne();
    return { ok: true };
  }
}

@Controller('admin/registrations')
@UseGuards(AdminGuard)
export class RegistrationsController {
  constructor(private svc: RegistrationsService) {}

  @Get()
  list(@Query('q') q?: string, @Query('eventId') eventId?: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.svc.list(q, eventId, Math.max(1, +page || 1), Math.min(100, Math.max(1, +limit || 20)));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}

@Module({ controllers: [RegistrationsController], providers: [RegistrationsService] })
export class RegistrationsModule {}
