import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './app.module';
import { CertificatesService } from './certificates/certificates.service';
import { Certificate, Event } from './database/schemas';

/**
 * Gives certificates issued under the old format (CERT-2026-000005) the current one (WTL-CSTN-00001),
 * in the order they were issued. Run `npm run regenerate-all -- --yes` afterwards so the PDFs show the new number.
 * Usage:  npm run renumber            (prints the plan)
 *         npm run renumber -- --yes   (does it)
 */
const SEED_CODES: Record<string, string> = { FIRSTAID2026: 'FAID', CLEANUP2026: 'CSTN' };
const OLD_FORMAT = /^CERT-\d{4}-\d{6}$/;

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const certs = app.get<Model<Certificate>>(getModelToken(Certificate.name));
  const events = app.get<Model<Event>>(getModelToken(Event.name));
  const service = app.get(CertificatesService);
  const yes = process.argv.includes('--yes');

  for (const [eventCode, certificateCode] of Object.entries(SEED_CODES)) {
    const e = await events.findOne({ eventCode });
    if (e && !e.certificateCode) {
      console.log(`Event ${eventCode}: certificate code -> ${certificateCode}`);
      if (yes) await events.updateOne({ _id: e._id }, { certificateCode });
    }
  }

  const old = await certs.find({ certificateNumber: OLD_FORMAT }).sort({ createdAt: 1 });
  console.log(`${old.length} certificates have the old number format.`);
  for (const c of old) {
    const event = await events.findById(c.eventId);
    if (!event) {
      console.error(`  skip ${c.certificateNumber}: event missing`);
      continue;
    }
    if (!yes) {
      console.log(`  ${c.certificateNumber}  (${event.certificateCode ?? SEED_CODES[event.eventCode] ?? event.eventCode.slice(0, 4)})`);
      continue;
    }
    const before = c.certificateNumber;
    c.certificateNumber = await service.nextNumber(event);
    await c.save();
    console.log(`  ${before} -> ${c.certificateNumber}`);
  }
  if (!yes) console.log('Dry run. Add --yes to renumber.');
  await app.close();
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
