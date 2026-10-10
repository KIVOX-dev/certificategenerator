import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { AppException } from '../common/app.exception';
import { escapeRegex, generateEventCode } from '../common/ids';
import { Certificate, Event, EventDoc, Registration } from '../database/schemas';
import { QrService } from '../qr/qr.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private events: Model<Event>,
    @InjectModel(Registration.name) private registrations: Model<Registration>,
    @InjectModel(Certificate.name) private certificates: Model<Certificate>,
    private qr: QrService,
  ) {}

  findByCode(code: string) {
    return this.events.findOne({ eventCode: String(code).toUpperCase().slice(0, 40) });
  }

  /** Public view: only what a participant needs. DRAFT events are invisible. */
  async publicByCode(code: string) {
    const e = await this.findByCode(code);
    if (!e || e.status === 'DRAFT') throw new AppException('EVENT_NOT_FOUND', 'This event link is not valid.', 404);
    return {
      eventCode: e.eventCode,
      name: e.name,
      description: e.description,
      organizationName: e.organizationName,
      open: e.status === 'ACTIVE',
    };
  }

  async create(dto: Partial<Event> & { eventCode?: string }) {
    let eventCode = dto.eventCode?.trim().toUpperCase();
    if (eventCode) {
      if (await this.events.exists({ eventCode })) throw new AppException('CONFLICT', 'That event code is already used.', 409);
    } else {
      do {
        eventCode = generateEventCode();
      } while (await this.events.exists({ eventCode }));
    }
    const doc = await this.events.create({ ...dto, eventCode });
    return this.detail(doc);
  }

  async update(id: string, dto: Partial<Event>) {
    const doc = await this.getDoc(id);
    delete (dto as any).eventCode; // the code is printed on QR codes, so it never changes
    Object.assign(doc, dto);
    await doc.save();
    return this.detail(doc);
  }

  /** Events with certificates are archived instead of deleted so issued certificates stay verifiable. */
  async remove(id: string) {
    const doc = await this.getDoc(id);
    if (await this.certificates.exists({ eventId: doc._id })) {
      doc.status = 'ARCHIVED';
      await doc.save();
      return { deleted: false, archived: true };
    }
    await this.registrations.deleteMany({ eventId: doc._id });
    await doc.deleteOne();
    return { deleted: true, archived: false };
  }

  async list(q?: string, page = 1, limit = 20) {
    const filter = q ? { $or: [{ name: new RegExp(escapeRegex(q), 'i') }, { eventCode: new RegExp(escapeRegex(q), 'i') }] } : {};
    const [items, total] = await Promise.all([
      this.events.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.events.countDocuments(filter),
    ]);
    const counts = await this.certificates.aggregate([
      { $match: { eventId: { $in: items.map((i) => i._id) } } },
      { $group: { _id: '$eventId', n: { $sum: 1 } } },
    ]);
    const byId = new Map(counts.map((c) => [String(c._id), c.n]));
    const base = await this.qr.siteUrl();
    return {
      items: items.map((e) => ({ ...this.summary(e, base), certificateCount: byId.get(String(e._id)) ?? 0 })),
      total,
      page,
      limit,
    };
  }

  async get(id: string) {
    return this.detail(await this.getDoc(id));
  }

  async getDoc(id: string): Promise<EventDoc> {
    const doc = isValidObjectId(id) ? await this.events.findById(id) : null;
    if (!doc) throw new AppException('NOT_FOUND', 'Event not found.', 404);
    return doc;
  }

  summary(e: EventDoc, siteUrl: string) {
    return {
      id: String(e._id),
      eventCode: e.eventCode,
      name: e.name,
      description: e.description,
      organizationName: e.organizationName,
      certificateTitle: e.certificateTitle,
      issueDate: e.issueDate,
      expiryDate: e.expiryDate,
      status: e.status,
      templateId: e.templateId ? String(e.templateId) : null,
      allowDuplicates: e.allowDuplicates,
      registrationUrl: `${siteUrl}/register/${encodeURIComponent(e.eventCode)}`,
      createdAt: e.createdAt,
    };
  }

  private async detail(e: EventDoc) {
    return { ...this.summary(e, await this.qr.siteUrl()), qrCodeDataUrl: await this.qr.registrationQr(e.eventCode) };
  }
}
