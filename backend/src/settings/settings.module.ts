import { Body, Controller, Get, HttpCode, Module, Post, Put, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AdminGuard } from '../auth/admin.guard';
import { CertificatesModule } from '../certificates/certificates.module';
import { CertificatesService } from '../certificates/certificates.service';
import { zodBody } from '../common/zod.pipe';
import { getConfig } from '../config/config';
import { QrService } from '../qr/qr.service';

const siteUrlSchema = z.object({ siteUrl: z.string().min(8).max(300) }).strict();

@Controller('admin/settings')
@UseGuards(AdminGuard)
export class SettingsController {
  constructor(private qr: QrService, private certs: CertificatesService) {}

  private async view() {
    const { url, source } = await this.qr.siteUrlInfo();
    return { siteUrl: url, source, environmentSiteUrl: getConfig().appUrl, ...(await this.certs.staleUrlCount()) };
  }

  @Get()
  get() {
    return this.view();
  }

  /** Sets the public site URL used in every QR code and link (overrides the APP_URL environment variable). */
  @Put('site-url')
  async setSiteUrl(@Body(zodBody(siteUrlSchema)) dto: z.infer<typeof siteUrlSchema>) {
    await this.qr.setSiteUrl(dto.siteUrl);
    return this.view();
  }

  /** Re-renders certificates whose QR code points at an old site URL. */
  @Post('fix-certificate-urls')
  @HttpCode(200)
  async fix() {
    await this.certs.fixStaleUrls();
    return this.view();
  }
}

@Module({ imports: [CertificatesModule], controllers: [SettingsController] })
export class SettingsModule {}
