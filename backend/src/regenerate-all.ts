import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './app.module';
import { CertificatesService } from './certificates/certificates.service';
import { Certificate } from './database/schemas';
import { QrService } from './qr/qr.service';

/**
 * Re-renders the PDF + preview of every issued certificate with the current template, so a changed design
 * applies to old certificates too. The QR code always encodes <site URL>/certificate/<certificateId>.
 * Usage:  npm run regenerate-all            (prints what it would do)
 *         npm run regenerate-all -- --yes   (does it)
 */
async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const certs = app.get<Model<Certificate>>(getModelToken(Certificate.name));
  const service = app.get(CertificatesService);
  const qr = app.get(QrService);
  const info = await qr.siteUrlInfo();
  const all = await certs.find({});
  console.log(`QR codes will point to ${info.url}/certificate/<id> (from ${info.source}); ${all.length} certificates.`);
  if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(info.url)) {
    console.error('The site URL is localhost - printed QR codes would not work. Set the public site URL first (admin Settings or APP_URL).');
    process.exit(1);
  }
  if (!process.argv.includes('--yes')) {
    console.log('Dry run. Add --yes to regenerate.');
    return app.close();
  }
  let done = 0;
  for (const c of all) {
    c.verificationUrl = await qr.verificationUrl(c.certificateId);
    c.pdfStatus = 'PENDING';
    await c.save();
    try {
      await service.ensureFiles(c);
      done++;
      console.log(`  ${c.certificateNumber}`);
    } catch (e) {
      console.error(`  FAILED ${c.certificateNumber}: ${e}`);
    }
  }
  console.log(`Done: ${done}/${all.length} regenerated`);
  await app.close();
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
