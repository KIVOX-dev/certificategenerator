import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { AdminCertificatesController, PublicCertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

@Module({
  imports: [EventsModule],
  controllers: [PublicCertificatesController, AdminCertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
