import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { CertificatesService } from './certificates/certificates.service';
import { getConfig } from './config/config';
import { Event, Template } from './database/schemas';
import { buildVolunteerTemplate } from './pdf/builtin-templates';
import { builtinPlaceholderHtml } from './pdf/template-renderers';

/**
 * Idempotent. Creates: admin user, two templates (the supplied "Volunteer Participation" design as the
 * default + the plain placeholder), sample events and the sample certificate for Ramesh Kumar.
 */
async function seed() {
  const cfg = getConfig();
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const { adminEmail: email, adminPassword: password } = cfg;
  if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to seed the admin user.');
  await app.get(AuthService).ensureAdmin(email, password, cfg.adminName);
  console.log(`Admin user ready: ${email}`);

  const templates = app.get<Model<Template>>(getModelToken(Template.name));
  const upsert = (name: string, type: 'HTML' | 'IMAGE', templateData: string, isDefault: boolean) =>
    templates.findOneAndUpdate({ name }, { name, type, templateData, isActive: true, isDefault }, { upsert: true, new: true });
  const placeholder = await upsert('Placeholder', 'HTML', builtinPlaceholderHtml(), false);
  const volunteer = await upsert('Volunteer Participation', 'IMAGE', buildVolunteerTemplate(), true);
  console.log('Templates ready: Placeholder, Volunteer Participation (default)');

  const events = app.get<Model<Event>>(getModelToken(Event.name));
  const ensureEvent = async (data: Partial<Event> & { eventCode: string }) =>
    (await events.findOne({ eventCode: data.eventCode })) ?? events.create(data);
  await ensureEvent({
    eventCode: 'FIRSTAID2026', certificateCode: 'FAID', name: 'First Aid Training Program', organizationName: 'ABC Foundation',
    description: 'Basic life support and first aid skills.', issueDate: new Date('2026-10-08T00:00:00+05:30'),
    status: 'ACTIVE', templateId: placeholder._id,
  });
  await ensureEvent({
    eventCode: 'CLEANUP2026', certificateCode: 'CSTN', name: 'Community Street Clean-Up Drive', organizationName: 'We The Leaders',
    certificateTitle: 'Certificate of Participation', issueDate: new Date('2026-10-08T00:00:00+05:30'),
    status: 'ACTIVE', templateId: volunteer._id,
  });

  const certs = app.get(CertificatesService);
  const sample = await certs.register('FIRSTAID2026', { fullName: 'Ramesh Kumar', phone: '9876543210' });
  await certs.register('CLEANUP2026', { fullName: 'Ramesh Kumar', phone: '9876543210' });
  console.log(`Sample events: ${cfg.appUrl}/register/FIRSTAID2026  ${cfg.appUrl}/register/CLEANUP2026`);
  console.log(`Sample certificate ${sample.certificate.certificateNumber} (${sample.outcome}): ${cfg.appUrl}/certificate/${sample.certificate.certificateId}`);
  await app.close();
}
seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
