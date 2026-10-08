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
    return { totalEvents, totalRegistrations, totalCertificates, activeCertificates, revokedCertificates, todaysCertificates };
  }
}

@Module({ controllers: [StatsController] })
export class StatsModule {}
