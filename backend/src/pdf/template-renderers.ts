import { readFileSync } from 'fs';
import { join } from 'path';
import { TemplateType } from '../database/schemas';

/** Everything a template may use. Certificate data only - no design lives here. */
export interface CertificateRenderData {
  certificateTitle: string;
  recipientName: string;
  eventName: string;
  eventDescription: string;
  organizationName: string;
  issueDate: string;
  certificateNumber: string;
  verificationUrl: string;
  qrDataUrl: string;
}

export interface PageSize {
  widthMm: number;
  heightMm: number;
}
export const A4_LANDSCAPE: PageSize = { widthMm: 297, heightMm: 210 };
export const mmToPx = (mm: number) => Math.round((mm / 25.4) * 96);

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** `{{placeholder}}` substitution with HTML escaping. */
export function fillPlaceholders(text: string, data: CertificateRenderData): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) =>
    key in data ? esc((data as unknown as Record<string, string>)[key]) : '',
  );
}
export const renderHtmlTemplate = fillPlaceholders;

interface FieldSpec {
  /** Position of the field as % of the page. For align=center/right, x is the centre/right edge. */
  x: number;
  y: number;
  /** Box width in % of the page (default 80). */
  width?: number;
  /** Font size in % of the page width (so it scales with the page). */
  fontSize?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  fontFamily?: string;
  bold?: boolean;
  upper?: boolean;
  /** Free text with {{placeholders}}; when omitted the field key is used as the value. */
  text?: string;
  /** QR only: size in % of the page width. */
  size?: number;
}

/**
 * IMAGE template spec: a PNG/JPG background, optional white "masks" that cover text baked into the
 * image, embedded fonts, and dynamic fields positioned by percentage.
 */
export interface ImageTemplateSpec {
  backgroundUrl: string;
  pageWidthMm?: number;
  pageHeightMm?: number;
  fonts?: { family: string; src: string; weight?: number }[];
  masks?: { x: number; y: number; width: number; height: number; color?: string }[];
  fields: Record<string, FieldSpec>;
}

const SAFE_URL = /^(https?:\/\/|data:)/i;
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i;
const color = (c: unknown, fallback: string) => (typeof c === 'string' && SAFE_COLOR.test(c) ? c : fallback);

export function parseImageSpec(specJson: string): ImageTemplateSpec {
  const spec = JSON.parse(specJson) as ImageTemplateSpec;
  if (!spec.backgroundUrl || !/^(https?:\/\/|data:image\/)/i.test(spec.backgroundUrl)) {
    throw new Error('Template backgroundUrl must be http(s) or data:image');
  }
  return spec;
}

export function pageSizeFor(template?: { type: TemplateType; templateData: string } | null): PageSize {
  if (template?.type === 'IMAGE') {
    const s = parseImageSpec(template.templateData);
    if (s.pageWidthMm && s.pageHeightMm) return { widthMm: +s.pageWidthMm, heightMm: +s.pageHeightMm };
  }
  return A4_LANDSCAPE;
}

export function renderImageTemplate(specJson: string, data: CertificateRenderData): string {
  const spec = parseImageSpec(specJson);
  const { widthMm, heightMm } = pageSizeFor({ type: 'IMAGE', templateData: specJson });
  const fonts = (spec.fonts ?? [])
    .filter((f) => SAFE_URL.test(f.src))
    .map((f) => `@font-face{font-family:"${esc(f.family)}";src:url("${esc(f.src)}");font-weight:${+(f.weight ?? 400)};}`)
    .join('');
  const parts: string[] = [];
  for (const m of spec.masks ?? []) {
    parts.push(`<div style="position:absolute;left:${+m.x}%;top:${+m.y}%;width:${+m.width}%;height:${+m.height}%;background:${color(m.color, '#fff')}"></div>`);
  }
  for (const [key, f] of Object.entries(spec.fields ?? {})) {
    if (key === 'qr') {
      parts.push(`<img src="${esc(data.qrDataUrl)}" alt="" style="position:absolute;left:${+f.x}%;top:${+f.y}%;width:${+(f.size ?? 10)}%;">`);
      continue;
    }
    const value = f.text !== undefined ? fillPlaceholders(f.text, data) : esc((data as unknown as Record<string, string>)[key] ?? '');
    if (!value) continue;
    const w = +(f.width ?? 80);
    const left = f.align === 'center' ? f.x - w / 2 : f.align === 'right' ? f.x - w : f.x;
    const family = (f.fontFamily ?? 'Georgia').replace(/[^\w\s-]/g, '');
    parts.push(
      `<div style="position:absolute;left:${+left}%;top:${+f.y}%;width:${w}%;text-align:${f.align === 'center' || f.align === 'right' ? f.align : 'left'};font-size:${+(f.fontSize ?? 2)}cqw;line-height:1.2;color:${color(f.color, '#111')};font-family:'${family}',Georgia,serif;font-weight:${f.bold ? 700 : 400};${f.upper ? 'text-transform:uppercase;' : ''}">${value}</div>`,
    );
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}@page{size:${widthMm}mm ${heightMm}mm;margin:0}*{margin:0;padding:0;box-sizing:border-box}html,body{width:${widthMm}mm;height:${heightMm}mm}.p{position:relative;container-type:size;width:${widthMm}mm;height:${heightMm}mm;overflow:hidden;background:#fff url("${esc(spec.backgroundUrl)}") center/100% 100% no-repeat}</style></head><body><div class="p">${parts.join('')}</div></body></html>`;
}

export function builtinPlaceholderHtml(): string {
  for (const dir of [join(__dirname, '../../templates'), join(process.cwd(), 'templates')]) {
    try {
      return readFileSync(join(dir, 'placeholder.html'), 'utf8');
    } catch {
      /* try next */
    }
  }
  throw new Error('placeholder.html template not found');
}

/** Registry: support a new template type by adding one function here. */
export const RENDERERS: Record<TemplateType, (templateData: string, data: CertificateRenderData) => string> = {
  HTML: (src, data) => fillPlaceholders(src, data),
  IMAGE: (src, data) => renderImageTemplate(src, data),
};
