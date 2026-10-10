'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { eventCodeFromScan } from '@/lib/api';
import { t } from '@/lib/i18n';

// BarcodeDetector is not in TypeScript's DOM lib yet.
interface Detector { detect(source: CanvasImageSource): Promise<{ rawValue: string }[]> }
declare global {
  interface Window { BarcodeDetector?: new (opts: { formats: string[] }) => Detector }
}

/** Event-code entry plus an in-browser QR scanner (where the phone's browser supports it). */
export function HomeEntry() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [canScan, setCanScan] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => setCanScan(!!window.BarcodeDetector && !!navigator.mediaDevices?.getUserMedia), []);

  function open(value: string) {
    const eventCode = eventCodeFromScan(value);
    if (!eventCode) return setError(t('error.EVENT_NOT_FOUND'));
    setError('');
    router.push(`/register/${eventCode}`);
  }

  useEffect(() => {
    if (!scanning) return;
    let stream: MediaStream | undefined;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (stopped) return stream.getTracks().forEach((tr) => tr.stop());
        const el = video.current!;
        el.srcObject = stream;
        await el.play();
        const detector = new window.BarcodeDetector!({ formats: ['qr_code'] });
        const tick = async () => {
          if (stopped) return;
          try {
            const hit = (await detector.detect(el))[0];
            if (hit) {
              setScanning(false);
              return open(hit.rawValue);
            }
          } catch {
            /* frame not ready yet */
          }
          timer = setTimeout(tick, 250);
        };
        tick();
      } catch {
        setScanning(false);
        setError(t('scanNeedsCamera'));
      }
    })();
    return () => {
      stopped = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  if (scanning) {
    return (
      <div className="scanner">
        <video ref={video} playsInline muted aria-label={t('scanHint')} />
        <p className="hint scanner-hint">{t('scanHint')}</p>
        <button type="button" className="btn secondary" onClick={() => setScanning(false)}>{t('cancel')}</button>
      </div>
    );
  }

  return (
    <>
      {error && <p role="alert" className="banner bad">{error}</p>}
      {canScan ? (
        <button type="button" className="btn" onClick={() => { setError(''); setScanning(true); }}>{t('scanQr')}</button>
      ) : null}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          open(code);
        }}
        noValidate
      >
        <div className="field">
          <label htmlFor="eventCode">{t('eventCode')}</label>
          <input
            id="eventCode"
            name="eventCode"
            type="text"
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder={t('eventCodePlaceholder')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <button type="submit" className={canScan ? 'btn secondary' : 'btn'}>{t('continue')}</button>
      </form>
    </>
  );
}
