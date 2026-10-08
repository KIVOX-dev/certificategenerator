import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { getConfig } from './config/config';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { CertificatesModule } from './certificates/certificates.module';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { PdfModule } from './pdf/pdf.module';
import { QrModule } from './qr/qr.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { StatsModule } from './stats/stats.module';
import { StorageModule } from './storage/storage.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: getConfig().rateLimit.global }], skipIf: () => process.env.DISABLE_RATE_LIMIT === 'true' }),
    DatabaseModule, StorageModule, QrModule, PdfModule, AuthModule,
    EventsModule, CertificatesModule, RegistrationsModule, TemplatesModule, StatsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
