import { readFileSync } from 'fs';
import { join } from 'path';
import { ImageTemplateSpec } from './template-renderers';

function templateDir(name: string): string {
  for (const dir of [join(__dirname, '../../templates', name), join(process.cwd(), 'templates', name)]) {
    try {
      readFileSync(join(dir, 'background.jpg'));
      return dir;
    } catch {
      /* try next */
    }
  }
  throw new Error(`template folder "${name}" not found`);
}
const dataUri = (path: string, mime: string) => `data:${mime};base64,${readFileSync(path).toString('base64')}`;

/**
 * "We The Leaders - Certificate of Participation" (the supplied design).
 * The artwork contains sample text ([Participant Name], [Date]...), so white masks cover those areas
 * and live data is drawn on top. Self-contained: background and fonts are embedded as data URIs.
 */
export function buildVolunteerTemplate(): string {
  const dir = templateDir('volunteer');
  const spec: ImageTemplateSpec = {
    backgroundUrl: dataUri(join(dir, 'background.jpg'), 'image/jpeg'),
    pageWidthMm: 280,
    pageHeightMm: 209,
    fonts: [
      { family: 'Great Vibes', src: dataUri(join(dir, 'GreatVibes.ttf'), 'font/ttf') },
      { family: 'Poppins', weight: 600, src: dataUri(join(dir, 'Poppins-SemiBold.ttf'), 'font/ttf') },
    ],
    masks: [
      { x: 23, y: 43, width: 54, height: 9.6 }, // [ Participant Name ]
      { x: 18, y: 59, width: 64, height: 8 }, // sample event title + "held on [Date] at [Location]"
      { x: 44.1, y: 52.3, width: 1, height: 0.6 }, // stray mark on the name underline
      { x: 22.5, y: 80, width: 10, height: 3.8 }, // [Date]
      { x: 66, y: 80, width: 13, height: 3.8 }, // [Signature]
    ],
    fields: {
      recipientName: { x: 50, y: 43.2, width: 54, align: 'center', fontSize: 6, fontFamily: 'Great Vibes', color: '#16204a' },
      eventName: { x: 50, y: 59.4, width: 66, align: 'center', fontSize: 2.55, fontFamily: 'Poppins', bold: true, upper: true, color: '#16204a' },
      issueDateLine: { x: 50, y: 64.6, width: 66, align: 'center', fontSize: 1.65, fontFamily: 'Poppins', color: '#16204a', text: 'held on {{issueDate}}' },
      issueDate: { x: 27.5, y: 80.4, width: 14, align: 'center', fontSize: 1.65, fontFamily: 'Poppins', color: '#16204a' },
      qr: { x: 45.6, y: 77.6, size: 8.8 },
      certificateNumber: { x: 50, y: 90.3, width: 36, align: 'center', fontSize: 1.1, fontFamily: 'Poppins', color: '#374151', text: 'Certificate No: {{certificateNumber}}' },
    },
  };
  return JSON.stringify(spec);
}
