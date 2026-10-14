'use client';

import { useState } from 'react';
import { workPhotos, workVideos, type WorkVideo } from '@/lib/media';

/** Two rows of field photos that scroll continuously in opposite directions; pauses on hover or focus. */
export function PhotoMarquee() {
  const half = Math.ceil(workPhotos.length / 2);
  const rows = [workPhotos.slice(0, half), workPhotos.slice(half)];
  return (
    <div className="cbe-marquee" aria-label="Photos from our work">
      {rows.map((row, r) => (
        <div key={r} className={`cbe-marquee-row${r ? ' reverse' : ''}`}>
          <ul className="cbe-marquee-track">
            {/* The row is rendered twice so the loop is seamless; the copy is hidden from assistive tech. */}
            {[0, 1].map((copy) =>
              row.map((p) => (
                <li key={`${copy}-${p.src}`} aria-hidden={copy === 1}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={copy === 1 ? '' : p.alt} width={800} height={500} loading="lazy" decoding="async" draggable={false} />
                </li>
              )),
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

function YouTube({ v }: { v: Extract<WorkVideo, { kind: 'youtube' }> }) {
  const [on, setOn] = useState(false);
  if (on) {
    return (
      <iframe
        className="cbe-vid-frame"
        src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
        title={v.title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }
  return (
    <button type="button" className="cbe-vid-poster" onClick={() => setOn(true)} aria-label={`Play video: ${v.title}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
      <span className="cbe-play" aria-hidden="true" />
    </button>
  );
}

/** Our videos: hosted clips play inline, YouTube ones load only after a click. */
export function VideoGallery() {
  return (
    <div className="cbe-videos">
      {workVideos.map((v) => (
        <article key={v.title} className="cbe-card cbe-vid">
          <div className="cbe-vid-media">
            {v.kind === 'file' ? (
              <video controls preload="none" playsInline poster={v.poster}>
                <source src={v.src} type="video/mp4" />
              </video>
            ) : (
              <YouTube v={v} />
            )}
          </div>
          <h3>{v.title}</h3>
          <p>{v.text}</p>
        </article>
      ))}
    </div>
  );
}
