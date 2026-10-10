import { Suspense } from 'react';
import { CertificateView } from '@/components/CertificateView';
import { LogoLoader } from '@/components/LogoLoader';
import { t } from '@/lib/i18n';

export default async function CertificatePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return (
    <Suspense fallback={<LogoLoader label={t('loading')} />}>
      <CertificateView reference={ref} />
    </Suspense>
  );
}
