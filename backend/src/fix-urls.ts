import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './app.module';
import { CertificatesService } from './certificates/certificates.service';
import { getConfig } from './config/config';
import { Certificate } from './database/schemas';
import { QrService } from './qr/qr.service';

/**
 * Repairs certificates issued while APP_URL was wrong: updates their verification URL to the current APP_URL and
 * re-renders the PDF + preview so the printed QR code points at the right site.
 * Usage:  APP_URL=https://your-site npm run fix-urls
 */
async function run() {
  const cfg = getConfig();
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const certs = app.get<Model<Certificate>>(getModelToken(Certificate.name));
  const service = app.get(CertificatesService);
  const qr = app.get(QrService);
  console.log(`Target site: ${await qr.siteUrl()} (APP_URL env: ${cfg.appUrl})`);

  const all = await certs.find({});
  const stale: typeof all = [];
  for (const c of all) if (c.verificationUrl !== (await qr.verificationUrl(c.certificateId))) stale.push(c);
  console.log(`${stale.length} of ${all.length} certificates need fixing`);
  let fixed = 0;
  for (const c of stale) {
    c.verificationUrl = await qr.verificationUrl(c.certificateId);
    c.pdfStatus = 'PENDING';
    await c.save();
    try {
      await service.ensureFiles(c);
      fixed++;
      console.log(`  fixed ${c.certificateNumber}`);
    } catch (e) {
      console.error(`  FAILED ${c.certificateNumber}: ${e}`);
    }
  }
  console.log(`Done: ${fixed}/${stale.length} regenerated`);
  await app.close();
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
