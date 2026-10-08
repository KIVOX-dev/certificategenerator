'use client';
import { useEffect, useState } from 'react';
import { pdfUrl } from '@/lib/api';
import { t } from '@/lib/i18n';

/** Uses the phone's native share sheet (WhatsApp, email, ...). Shares the PDF when supported, else the link. */
export function ShareButton({ certificateId, certificateNumber, title }: { certificateId: string; certificateNumber: string; title: string }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(typeof navigator !== 'undefined' && typeof navigator.share === 'function'), []);
  if (!supported) return null;

  async function share() {
    const link = `${window.location.origin}/certificate/${certificateId}`;
    try {
      const res = await fetch(pdfUrl(certificateId));
      if (res.ok) {
        const file = new File([await res.blob()], `Certificate-${certificateNumber}.pdf`, { type: 'application/pdf' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title });
          return;
        }
      }
      await navigator.share({ title, url: link });
    } catch {
      /* user cancelled the share sheet */
    }
  }

  return (
    <button type="button" className="btn secondary" onClick={share}>
      {t('shareCertificate')}
    </button>
  );
}
