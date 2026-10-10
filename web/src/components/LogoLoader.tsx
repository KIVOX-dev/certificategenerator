'use client';
import { useLoadingFavicon } from './useLoadingFavicon';

/** Animated We The Leaders logo: the three figures spring up in turn, the wordmark pulses. Used for every loading state. */
export function LogoLoader({ label = 'Loading…', fullscreen = false }: { label?: string; fullscreen?: boolean }) {
  useLoadingFavicon();
  return (
    <div className={`logo-loader${fullscreen ? ' fullscreen' : ''}`} role="status" aria-live="polite">
      <svg className="ll-mark" viewBox="60 100 410 300" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="llg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cb83e" /><stop offset="1" stopColor="#2f7d3a" /></linearGradient>
          <linearGradient id="llo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f0922f" /><stop offset="1" stopColor="#d4691c" /></linearGradient>
          <linearGradient id="llb" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#2a8bc9" /><stop offset="1" stopColor="#175f9a" /></linearGradient>
        </defs>
        <g className="ll-orange"><path fill="url(#llo)" d="M76 372C120 354 152 346 165 322C171 298 175 278 179 262C196 304 216 346 250 382C200 374 130 366 76 372Z" /><circle cx="148" cy="321" r="17" fill="#ee8c2b" /></g>
        <g className="ll-green"><path fill="url(#llg)" d="M205 125C183 178 192 245 242 312L265 382L288 312C338 245 347 178 325 125C331 188 312 250 265 302C218 250 199 188 205 125Z" /><circle className="ll-head" cx="265" cy="210" r="33" fill="#6fb23a" /></g>
        <g className="ll-blue"><path fill="url(#llb)" d="M454 372C410 354 378 346 365 322C359 298 355 278 351 262C334 304 314 346 280 382C330 374 400 366 454 372Z" /><circle cx="382" cy="321" r="17" fill="#2a86c4" /></g>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ll-word" src={'/logo-wordmark.svg'} alt="" width={168} height={36} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
