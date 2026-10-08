'use client';
import { useState } from 'react';
import { pdfUrl } from '@/lib/api';
import { t } from '@/lib/i18n';

/** Fetches the PDF, then saves it to the device. Shows plain-language progress. */
export function DownloadButton({ certificateId, certificateNumber }: { certificateId: string; certificateNumber: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  async function download() {
    setState('busy');
    try {
      const res = await fetch(pdfUrl(certificateId));
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setState('done');
    } catch {
      setState('error');
    }
  }

  return (
    <div>
      <button type="button" className="btn" onClick={download} disabled={state === 'busy'}>
        {t('downloadCertificate')}
      </button>
      <div role="status" aria-live="polite">
        {state === 'busy' && <p className="banner warn">{t('preparingDownload')}</p>}
        {state === 'done' && <p className="banner ok">{t('downloadReady')}</p>}
      </div>
      {state === 'error' && (
        <p role="alert" className="error">
          {t('error.download')}
        </p>
      )}
    </div>
  );
}
