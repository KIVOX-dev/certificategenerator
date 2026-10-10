'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ApiError, errorKey, formatDate, getCertificate, previewUrl, PublicCertificate } from '@/lib/api';
import { t } from '@/lib/i18n';
import { DownloadButton } from './DownloadButton';
import { LogoLoader } from './LogoLoader';
import { ShareButton } from './ShareButton';

function StatusBadge({ kind, title, text }: { kind: 'ok' | 'bad'; title: string; text?: string }) {
  return (
    <div className={`verify ${kind}`} role="status">
      <span className="verify-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          {kind === 'ok' ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
        </svg>
      </span>
      <span className="verify-text">
        <strong>{title}</strong>
        {text && <span>{text}</span>}
      </span>
    </div>
  );
}

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
        <StatusBadge kind="bad" title={t('certificateNotFoundText')} />
        <p className="lead">{t('certificateNotFoundHint')}</p>
      </>
    );
  }
  if (error) return <p role="alert" className="banner bad">{t(error)}</p>;
  if (!cert) return <LogoLoader label={t('loading')} />;

  if (cert.status === 'REVOKED') {
    return (
      <>
        <h1 ref={heading} tabIndex={-1}>{t('certificateRevoked')}</h1>
        <StatusBadge kind="bad" title={t('certificateRevoked')} text={t('certificateRevokedText')} />
        <dl className="details"><div><dt>{t('certificateNumber')}</dt><dd>{cert.certificateNumber}</dd></div></dl>
      </>
    );
  }

  const expired = cert.status === 'EXPIRED';
  const preview = (
    <a className="preview-link" href={previewUrl(cert.certificateId)} target="_blank" rel="noopener">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="preview" src={previewUrl(cert.certificateId)} alt={t('certificatePreviewAlt')} decoding="async" />
    </a>
  );

  return (
    <>
      {isNew && !expired ? (
        <>
          <h1 ref={heading} tabIndex={-1}>{t('certificateReady')}</h1>
          <p className="lead">{t('issuedTo')}</p>
        </>
      ) : (
        <>
          <h1 ref={heading} tabIndex={-1}>{t('certificateTitle')}</h1>
          {expired ? (
            <StatusBadge kind="bad" title={t('certificateExpired')} text={t('certificateExpiredText')} />
          ) : (
            <StatusBadge kind="ok" title={t('validCertificate')} text={t('verifiedBy')} />
          )}
        </>
      )}

      <div className="recipient">
        <span className="label">{t('issuedToLabel')}</span>
        <p className="recipient-name">{cert.recipientName}</p>
      </div>

      {!expired && (
        <>
          {preview}
          <p className="hint">{t('openLarge')}</p>
          <div className="actions-inline">
            <DownloadButton certificateId={cert.certificateId} certificateNumber={cert.certificateNumber} />
            <ShareButton certificateId={cert.certificateId} certificateNumber={cert.certificateNumber} title={cert.eventName ?? t('certificateTitle')} />
          </div>
        </>
      )}

      <dl className="details">
        <div><dt>{t('certificateNumber')}</dt><dd>{cert.certificateNumber}</dd></div>
        <div><dt>{t('course')}</dt><dd>{cert.eventName}</dd></div>
        <div><dt>{t('issued')}</dt><dd>{formatDate(cert.issueDate)}</dd></div>
        <div><dt>{t('organization')}</dt><dd>{cert.organizationName}</dd></div>
      </dl>
    </>
  );
}
