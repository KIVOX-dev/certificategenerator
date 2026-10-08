import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { SkipThrottle } from '@nestjs/throttler';
import { Connection } from 'mongoose';

/** Used by Render's health check (path: /api/health). */
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(@InjectConnection() private db: Connection) {}

  @Get()
  health() {
    return { ok: true, database: this.db.readyState === 1 ? 'up' : 'down' };
  }
}
