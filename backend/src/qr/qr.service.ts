import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as QRCode from 'qrcode';
import { AppException } from '../common/app.exception';
import { getConfig } from '../config/config';
import { Setting } from '../database/schemas';

const SITE_URL_KEY = 'siteUrl';
const CACHE_MS = 15_000;

/**
 * Two distinct QR purposes: event registration and certificate verification.
 * Both are built from the public site URL: the admin-editable setting (database) wins over the APP_URL env var,
 * so a wrong environment variable can be corrected from the admin panel without redeploying.
 */
@Injectable()
export class QrService {
  private cache?: { value: string; at: number };

  constructor(@InjectModel(Setting.name) private settings: Model<Setting>) {}

  /** The public site URL in effect, with where it came from. */
  async siteUrlInfo(): Promise<{ url: string; source: 'database' | 'environment' }> {
    if (!this.cache || Date.now() - this.cache.at > CACHE_MS) {
      const row = await this.settings.findById(SITE_URL_KEY).lean();
      this.cache = { value: row?.value ?? '', at: Date.now() };
    }
    return this.cache.value ? { url: this.cache.value, source: 'database' } : { url: getConfig().appUrl, source: 'environment' };
  }

  async siteUrl(): Promise<string> {
    return (await this.siteUrlInfo()).url;
  }

  async setSiteUrl(input: string): Promise<string> {
    let url: URL;
    try {
      url = new URL(input.trim());
    } catch {
      throw new AppException('VALIDATION_ERROR', 'Please enter a full web address, e.g. https://certs.example.com', 400);
    }
    const local = /^(localhost|127\.0\.0\.1)$/.test(url.hostname);
    if (!['http:', 'https:'].includes(url.protocol) || (url.protocol === 'http:' && !local)) {
      throw new AppException('VALIDATION_ERROR', 'The public site address must start with https://', 400);
    }
    const value = url.origin; // scheme + host (+ port), no path or trailing slash
    await this.settings.findByIdAndUpdate(SITE_URL_KEY, { value }, { upsert: true });
    this.cache = { value, at: Date.now() };
    return value;
  }

  async registrationUrl(eventCode: string) {
    return `${await this.siteUrl()}/register/${encodeURIComponent(eventCode)}`;
  }

  async verificationUrl(certificateId: string) {
    return `${await this.siteUrl()}/certificate/${encodeURIComponent(certificateId)}`;
  }

  dataUrl(text: string, width = 512): Promise<string> {
    return QRCode.toDataURL(text, { errorCorrectionLevel: 'M', margin: 2, width });
  }

  async registrationQr(eventCode: string) {
    return this.dataUrl(await this.registrationUrl(eventCode), 1024);
  }

  async verificationQr(certificateId: string) {
    return this.dataUrl(await this.verificationUrl(certificateId), 400);
  }
}
