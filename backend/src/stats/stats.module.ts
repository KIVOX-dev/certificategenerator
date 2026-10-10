import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminGuard } from '../auth/admin.guard';
import { Certificate, Event, Registration } from '../database/schemas';

@Controller('admin/stats')
@UseGuards(AdminGuard)
export class StatsController {
  constructor(
    @InjectModel(Event.name) private events: Model<Event>,
    @InjectModel(Registration.name) private regs: Model<Registration>,
    @InjectModel(Certificate.name) private certs: Model<Certificate>,
  ) {}

  @Get()
  async stats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [totalEvents, totalRegistrations, totalCertificates, activeCertificates, revokedCertificates, todaysCertificates] = await Promise.all([
      this.events.countDocuments(),
      this.regs.countDocuments(),
      this.certs.countDocuments(),
      this.certs.countDocuments({ status: 'ACTIVE' }),
      this.certs.countDocuments({ status: 'REVOKED' }),
      this.certs.countDocuments({ createdAt: { $gte: startOfDay } }),
    ]);
    const expiredCertificates = totalCertificates - activeCertificates - revokedCertificates;

    // Certificates per day (IST) for the last 30 days, zero-filled so the chart has no gaps.
    const DAYS = 30;
    const since = new Date(Date.now() - (DAYS - 1) * 86_400_000);
    since.setHours(0, 0, 0, 0);
    const [daily, byEvent] = await Promise.all([
      this.certs.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } }, count: { $sum: 1 } } },
      ]),
      this.certs.aggregate<{ _id: unknown; count: number }>([
        { $group: { _id: '$eventId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);
    const counts = new Map(daily.map((d) => [d._id, d.count]));
    const certificatesPerDay = Array.from({ length: DAYS }, (_, i) => {
      const date = new Date(Date.now() - (DAYS - 1 - i) * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      return { date, count: counts.get(date) ?? 0 };
    });
    const eventDocs = await this.events.find({ _id: { $in: byEvent.map((e) => e._id) } }, { name: 1 }).lean();
    const names = new Map(eventDocs.map((e) => [String(e._id), e.name]));
    const topEvents = byEvent.map((e) => ({ name: names.get(String(e._id)) ?? 'Unknown event', count: e.count }));

    return {
      totalEvents, totalRegistrations, totalCertificates, activeCertificates, revokedCertificates, todaysCertificates,
      expiredCertificates, certificatesPerDay, topEvents,
    };
  }
}

@Module({ controllers: [StatsController] })
export class StatsModule {}
