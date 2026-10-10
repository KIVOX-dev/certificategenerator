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
 * The artwork already contains all wording; live data (name, QR, certificate number) is drawn on top. Self-contained: background and fonts are embedded as data URIs.
 */
export function buildVolunteerTemplate(): string {
  const dir = templateDir('volunteer');
  const spec: ImageTemplateSpec = {
    backgroundUrl: dataUri(join(dir, 'background.jpg'), 'image/jpeg'),
    pageWidthMm: 297,
    pageHeightMm: 210,
    fonts: [
      { family: 'Great Vibes', src: dataUri(join(dir, 'GreatVibes.ttf'), 'font/ttf') },
      { family: 'Poppins', weight: 600, src: dataUri(join(dir, 'Poppins-SemiBold.ttf'), 'font/ttf') },
    ],
    // The wording, logo and signature are part of the artwork; only the personal data is drawn on top.
    fields: {
      recipientName: { x: 50, y: 37.8, width: 60, align: 'center', fontSize: 6, fontFamily: 'Great Vibes', color: '#1d6b55' },
      qr: { x: 76, y: 76, size: 8.8 },
      certificateNumber: { x: 80.4, y: 88.6, width: 24, align: 'center', fontSize: 1.1, fontFamily: 'Poppins', color: '#374151', text: 'Certificate No: {{certificateNumber}}' },
    },
  };
  return JSON.stringify(spec);
}
