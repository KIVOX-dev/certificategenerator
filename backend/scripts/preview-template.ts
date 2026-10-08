// Renders the built-in volunteer template with sample data to preview.pdf / preview.jpg.
// Usage (from backend/):  npx ts-node scripts/preview-template.ts [outDir]
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { buildVolunteerTemplate } from '../src/pdf/builtin-templates';
import { PdfService } from '../src/pdf/pdf.service';
import { QrService } from '../src/qr/qr.service';

(async () => {
  const out = process.argv[2] ?? '.';
  mkdirSync(out, { recursive: true });
  const pdf = new PdfService();
  const qr = await new QrService().verificationQr('kcsrsgg8z3cd8d55');
  const { pdf: p, preview } = await pdf.render(
    {
      certificateTitle: 'Certificate of Participation', recipientName: process.argv[3] ?? 'Ramesh Kumar', eventName: 'Community Street Clean-Up Drive',
      eventDescription: '', organizationName: 'We The Leaders', issueDate: '08 October 2026', certificateNumber: 'CERT-2026-000001',
      verificationUrl: 'https://example.com/certificate/kcsrsgg8z3cd8d55', qrDataUrl: qr,
    },
    { type: 'IMAGE', templateData: buildVolunteerTemplate() },
  );
  writeFileSync(join(out, 'preview.pdf'), p);
  writeFileSync(join(out, 'preview.webp'), preview);
  await pdf.onModuleDestroy();
  console.log('written to', out);
})();
