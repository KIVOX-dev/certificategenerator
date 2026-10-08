import { Body, Controller, Get, HttpCode, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { AdminGuard } from '../auth/admin.guard';
import { getConfig } from '../config/config';
import { zodBody } from '../common/zod.pipe';
import { CertificatesService } from './certificates.service';

const registerSchema = z.object({ fullName: z.string().max(200), phone: z.string().max(40) }).strict();

function send(res: any, f: { buffer: Buffer; filename: string; contentType: string }, download: boolean) {
  res.set({
    'Content-Type': f.contentType,
    'Content-Length': String(f.buffer.length),
    'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${f.filename}"`,
    'Cache-Control': 'private, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(f.buffer);
}

@Controller()
export class PublicCertificatesController {
  constructor(private certs: CertificatesService) {}

  @Post('events/:eventCode/register')
  @HttpCode(200)
  @Throttle({ default: { limit: () => getConfig().rateLimit.register, ttl: 60_000 } })
  register(@Param('eventCode') code: string, @Body(zodBody(registerSchema)) dto: z.infer<typeof registerSchema>) {
    return this.certs.register(code, dto);
  }

  @Get('certificates/:ref')
  @Throttle({ default: { limit: () => getConfig().rateLimit.lookup, ttl: 60_000 } })
  get(@Param('ref') ref: string) {
    return this.certs.publicByRef(ref);
  }

  @Get('certificates/:ref/pdf')
  @Throttle({ default: { limit: () => getConfig().rateLimit.lookup, ttl: 60_000 } })
  async pdf(@Param('ref') ref: string, @Res() res: any) {
    send(res, await this.certs.fileByRef(ref, 'pdf'), true);
  }

  @Get('certificates/:ref/preview')
  @Throttle({ default: { limit: () => getConfig().rateLimit.lookup, ttl: 60_000 } })
  async preview(@Param('ref') ref: string, @Res() res: any) {
    send(res, await this.certs.fileByRef(ref, 'preview'), false);
  }
}

@Controller('admin/certificates')
@UseGuards(AdminGuard)
export class AdminCertificatesController {
  constructor(private certs: CertificatesService) {}

  @Get()
  list(@Query('q') q?: string, @Query('status') status?: string, @Query('eventId') eventId?: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.certs.adminList({ q, status, eventId, page: Math.max(1, +page || 1), limit: Math.min(100, Math.max(1, +limit || 20)) });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.certs.adminGet(id);
  }

  @Get(':id/pdf')
  async pdf(@Param('id') id: string, @Res() res: any) {
    send(res, await this.certs.adminFile(id, 'pdf'), true);
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string, @Res() res: any) {
    send(res, await this.certs.adminFile(id, 'preview'), false);
  }

  @Post(':id/revoke')
  @HttpCode(200)
  revoke(@Param('id') id: string) {
    return this.certs.setRevoked(id, true);
  }

  @Post(':id/restore')
  @HttpCode(200)
  restore(@Param('id') id: string) {
    return this.certs.setRevoked(id, false);
  }

  @Post(':id/regenerate')
  @HttpCode(200)
  regenerate(@Param('id') id: string) {
    return this.certs.regenerate(id);
  }
}
