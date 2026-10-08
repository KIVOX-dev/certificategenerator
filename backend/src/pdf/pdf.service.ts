import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { getConfig } from '../config/config';
import { TemplateType } from '../database/schemas';
import { A4_LANDSCAPE, builtinPlaceholderHtml, CertificateRenderData, mmToPx, pageSizeFor, RENDERERS, renderHtmlTemplate } from './template-renderers';

export interface TemplateSource {
  type: TemplateType;
  templateData: string;
}

/** Certificate data + template -> HTML -> Chromium -> print-quality PDF and a JPEG preview. */
@Injectable()
export class PdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private browser?: Promise<Browser>;
  private active = 0;
  private waiters: Array<() => void> = [];
  private static readonly MAX_PARALLEL = 2;

  private getBrowser(): Promise<Browser> {
    if (!this.browser) {
      const noSandbox = process.env.PUPPETEER_NO_SANDBOX === 'true';
      this.browser = puppeteer
        .launch({
          headless: true,
          executablePath: getConfig().puppeteerExecutablePath,
          args: noSandbox ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
        })
        .then((b) => {
          b.on('disconnected', () => {
            this.browser = undefined;
          });
          return b;
        })
        .catch((e) => {
          this.browser = undefined;
          throw e;
        });
    }
    return this.browser;
  }

  private async slot<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= PdfService.MAX_PARALLEL) await new Promise<void>((r) => this.waiters.push(r));
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      this.waiters.shift()?.();
    }
  }

  buildHtml(data: CertificateRenderData, template?: TemplateSource | null): string {
    if (!template) return renderHtmlTemplate(builtinPlaceholderHtml(), data);
    return RENDERERS[template.type](template.templateData, data);
  }

  async render(data: CertificateRenderData, template?: TemplateSource | null): Promise<{ pdf: Buffer; preview: Buffer }> {
    const html = this.buildHtml(data, template);
    const size = template ? pageSizeFor(template) : A4_LANDSCAPE;
    const widthPx = mmToPx(size.widthMm);
    const heightPx = mmToPx(size.heightMm);
    return this.slot(async () => {
      const page = await (await this.getBrowser()).newPage();
      try {
        await page.setJavaScriptEnabled(false); // templates are static; no script execution
        await page.setViewport({ width: widthPx, height: heightPx, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
        const pdf = Buffer.from(await page.pdf({ width: `${size.widthMm}mm`, height: `${size.heightMm}mm`, printBackground: true, preferCSSPageSize: true }));
        const preview = Buffer.from(
          await page.screenshot({ type: 'webp', quality: 80, clip: { x: 0, y: 0, width: widthPx, height: heightPx } }),
        );
        return { pdf, preview };
      } finally {
        await page.close().catch(() => undefined);
      }
    });
  }

  async onModuleDestroy() {
    const b = await this.browser?.catch(() => undefined);
    await b?.close().catch((e) => this.logger.warn(String(e)));
  }
}
