'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ApiError, errorKey, formatDate, getCertificate, previewUrl, PublicCertificate } from '@/lib/api';
import { t } from '@/lib/i18n';
import { DownloadButton } from './DownloadButton';
import { ShareButton } from './ShareButton';

export function CertificateView({ reference, isNew: isNewProp }: { reference: string; isNew?: boolean }) {
  const params = useSearchParams();
  const isNew = isNewProp ?? params.get('new') === '1';
  const [cert, setCert] = useState<PublicCertificate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    getCertificate(reference)
      .then(setCert)
      .catch((e) => {
        if (e instanceof ApiError && e.code === 'CERTIFICATE_NOT_FOUND') setNotFound(true);
        else setError(errorKey(e));
      });
  }, [reference]);

  useEffect(() => heading.current?.focus(), [cert, notFound, error]);

  if (notFound) {
    return (
      <>
        <h1 ref={heading} tabIndex={-1}>{t('certificateNotFound')}</h1>
        <p className="banner bad">✗ {t('certificateNotFoundText')}</p>
        <p className="lead">{t('certificateNotFoundHint')}</p>
      </>
    );
  }
  if (error) return <p role="alert" className="banner bad">{t(error)}</p>;
  if (!cert) return <p className="loading" role="status">{t('loading')}</p>;

  if (cert.status === 'REVOKED') {
    return (
      <>
        <h1 ref={heading} tabIndex={-1}>{t('certificateRevoked')}</h1>
        <p className="banner bad">✗ {t('certificateRevokedText')}</p>
        <dl className="card"><dt>{t('certificateNumber')}</dt><dd>{cert.certificateNumber}</dd></dl>
      </>
    );
  }

  const expired = cert.status === 'EXPIRED';
  const preview = (
    <a className="preview-link" href={previewUrl(cert.certificateId)} target="_blank" rel="noopener">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="preview" src={previewUrl(cert.certificateId)} alt={t('certificatePreviewAlt')} />
    </a>
  );

  return (
    <>
      {isNew && !expired ? (
        <>
          <h1 ref={heading} tabIndex={-1} className="success">✓ {t("certificateReady")}</h1>
          <p className="lead">{t('issuedTo')}</p>
          <p className="big-name">{cert.recipientName}</p>
        </>
      ) : (
        <>
          <h1 ref={heading} tabIndex={-1}>{t('certificateTitle')}</h1>
          {expired ? (
            <p className="banner bad">✗ {t('certificateExpired')}. {t('certificateExpiredText')}</p>
          ) : (
            <p className="banner ok" role="status"><span className="status-title">✓ {t('validCertificate').toUpperCase()}</span></p>
          )}
          <p className="big-name">{cert.recipientName}</p>
        </>
      )}

      {!expired && (
        <>
          {preview}
          <p className="hint">{t('openLarge')}</p>
          <DownloadButton certificateId={cert.certificateId} certificateNumber={cert.certificateNumber} />
          <ShareButton certificateId={cert.certificateId} certificateNumber={cert.certificateNumber} title={cert.eventName ?? t('certificateTitle')} />
        </>
      )}

      <dl className="card">
        <dt>{t('certificateNumber')}</dt><dd>{cert.certificateNumber}</dd>
        <dt>{t('course')}</dt><dd>{cert.eventName}</dd>
        <dt>{t('issued')}</dt><dd>{formatDate(cert.issueDate)}</dd>
        <dt>{t('organization')}</dt><dd>{cert.organizationName}</dd>
      </dl>
    </>
  );
}
