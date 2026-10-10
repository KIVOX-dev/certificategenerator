'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { LogoLoader } from './LogoLoader';
import { ApiError, errorKey, getEvent, PublicCertificate, PublicEvent, registerForEvent } from '@/lib/api';
import { t } from '@/lib/i18n';
import { cleanName, FormErrors, normalizeIndianPhone, validateForm } from '@/lib/validation';

type Step = 'loading' | 'invalid' | 'closed' | 'form' | 'confirm' | 'creating' | 'existing' | 'processing';

export function RegisterFlow({ eventCode }: { eventCode: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('loading');
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [existing, setExisting] = useState<PublicCertificate | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let cancelled = false;
    getEvent(eventCode)
      .then((e) => {
        if (cancelled) return;
        setEvent(e);
        setStep(e.open ? 'form' : 'closed');
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.code === 'EVENT_NOT_FOUND') setStep('invalid');
        else {
          setServerError(errorKey(e));
          setStep('invalid');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [eventCode]);

  // Move screen-reader focus to the new step's heading.
  useEffect(() => heading.current?.focus(), [step]);

  function onContinue(e: FormEvent) {
    e.preventDefault();
    const found = validateForm(fullName, phone);
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length === 0) {
      setFullName(cleanName(fullName));
      setStep('confirm');
    }
  }

  async function onConfirm() {
    setStep('creating');
    setServerError(null);
    try {
      const { outcome, certificate } = await registerForEvent(eventCode, cleanName(fullName), phone);
      if (outcome === 'CREATED') {
        router.push(`/certificate/${certificate.certificateId}?new=1`);
      } else {
        setExisting(certificate);
        setStep(outcome === 'PROCESSING' ? 'processing' : 'existing');
      }
    } catch (e) {
      if (e instanceof ApiError && (e.code === 'INVALID_NAME' || e.code === 'INVALID_PHONE')) {
        setErrors(e.code === 'INVALID_NAME' ? { fullName: 'INVALID_NAME' } : { phone: 'INVALID_PHONE' });
        setStep('form');
      } else if (e instanceof ApiError && e.code === 'EVENT_CLOSED') {
        setStep('closed');
      } else {
        setServerError(errorKey(e));
        setStep('confirm');
      }
    }
  }

  const h = (text: string) => (
    <h1 ref={heading} tabIndex={-1}>
      {text}
    </h1>
  );

  if (step === 'loading') return <LogoLoader label={t('loading')} />;

  if (step === 'invalid') {
    return (
      <>
        {h(t('getCertificate'))}
        <p role="alert" className="banner bad">{t(serverError ?? 'error.EVENT_NOT_FOUND')}</p>
      </>
    );
  }

  if (step === 'closed') {
    return (
      <>
        {h(t('registrationClosed'))}
        <p className="banner warn">{t('registrationClosedText')}</p>
        {event && <p className="event-name">{event.name}</p>}
      </>
    );
  }

  if (step === 'creating') {
    return (
      <>
        <h1 ref={heading} tabIndex={-1}>{t('getCertificate')}</h1>
        <p role="status" className="banner warn">{t('creating')}</p>
      </>
    );
  }

  if (step === 'existing' || step === 'processing') {
    return (
      <>
        {h(t('getCertificate'))}
        <p role="status" className="banner warn">{t(step === 'existing' ? 'existingFound' : 'alreadyPreparing')}</p>
        {step === 'existing' && existing && (
          <Link className="btn" href={`/certificate/${existing.certificateId}`}>{t('viewMyCertificate')}</Link>
        )}
        {step === 'processing' && (
          <button type="button" className="btn" onClick={onConfirm}>{t('tryAgain')}</button>
        )}
      </>
    );
  }

  if (step === 'confirm') {
    return (
      <>
        <span className="step">{t("step2")}</span>
        <div className="progress" aria-hidden="true"><i className="on" /><i className="on" /></div>
        {h(t('checkName'))}
        <p className="lead">{t('certificateWillBeCreatedFor')}</p>
        <p className="big-name" data-testid="confirm-name">{cleanName(fullName)}</p>
        <p className="lead">{t('phoneNumber')}:</p>
        <p className="big-name" data-testid="confirm-phone">{normalizeIndianPhone(phone)}</p>
        {serverError && <p role="alert" className="error">{t(serverError)}</p>}
        <div className="actions">
          <button type="button" className="btn" onClick={onConfirm}>{t('yesContinue')}</button>
          <button type="button" className="btn secondary" onClick={() => setStep('form')}>{t('editDetails')}</button>
        </div>
      </>
    );
  }

  return (
    <>
      <span className="step">{t("step1")}</span>
      <div className="progress" aria-hidden="true"><i className="on" /><i /></div>
      {h(t('getCertificate'))}
      {event && <p className="event-name">{event.name}</p>}
      <p className="lead">{t('enterDetails')}</p>
      <form onSubmit={onContinue} noValidate>
        <div className="field">
          <label htmlFor="fullName">{t('fullName')}</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            placeholder={t('fullNamePlaceholder')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          />
          {errors.fullName && <p id="fullName-error" role="alert" className="error">{t(`error.${errors.fullName}`)}</p>}
        </div>
        <div className="field">
          <label htmlFor="phone">{t('phoneNumber')}</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            enterKeyHint="go"
            autoComplete="tel"
            placeholder={t('phonePlaceholder')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && <p id="phone-error" role="alert" className="error">{t(`error.${errors.phone}`)}</p>}
        </div>
        <div className="actions">
          <button type="submit" className="btn">{t('continue')}</button>
        </div>
      </form>
    </>
  );
}
