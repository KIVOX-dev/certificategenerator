import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { SkipThrottle } from '@nestjs/throttler';
import { Connection } from 'mongoose';
import { QrService } from './qr/qr.service';

/**
 * Used by Render's health check and by the post-deploy smoke test (scripts/smoke-prod.mjs).
 * `commit` lets the pipeline wait until the new version is live; `appUrl` catches a mis-set APP_URL
 * (the QR codes on certificates are built from it). Nothing secret is exposed.
 */
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(@InjectConnection() private db: Connection, private qr: QrService) {}

  @Get()
  async health() {
    return {
      ok: true,
      database: this.db.readyState === 1 ? 'up' : 'down',
      appUrl: await this.qr.siteUrl(),
      commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || null,
    };
  }
}
