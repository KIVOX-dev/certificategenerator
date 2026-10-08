import { Suspense } from 'react';
import { CertificateView } from '@/components/CertificateView';
import { t } from '@/lib/i18n';

export default async function CertificatePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return (
    <Suspense fallback={<p className="loading">{t('loading')}</p>}>
      <CertificateView reference={ref} />
    </Suspense>
  );
}
