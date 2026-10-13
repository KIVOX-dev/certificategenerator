import type { Metadata } from 'next';
import { HomeEntry } from '@/components/HomeEntry';
import { t } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Certificates – We The Leaders Coimbatore',
  description: 'Get or verify your We The Leaders certificate.',
};

export default function GetCertificate() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">Certificates</p>
        <h1>{t('getCertificate')}</h1>
        <p className="cbe-lead">{t('homeText')}</p>
      </section>

      <section className="cbe-section">
        <div className="cbe-register">
          <HomeEntry />
        </div>
        <p className="cbe-note">Already have a certificate? Scan the QR code printed on it to verify it.</p>
      </section>
    </>
  );
}
