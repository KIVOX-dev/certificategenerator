'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { formatDate, listEvents, type PublicEvent } from '@/lib/api';
import { photoFor } from '@/lib/media';

const istDay = (d: Date | string) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD

/** Upcoming = registration open and not yet past; everything else is "previously". Driven by the admin app. */
export function splitEvents(events: PublicEvent[]) {
  const today = istDay(new Date());
  const time = (e: PublicEvent) => (e.date ? new Date(e.date).getTime() : Infinity);
  const upcoming = events.filter((e) => e.open && (!e.date || istDay(e.date) >= today)).sort((a, b) => time(a) - time(b));
  const previous = events
    .filter((e) => !upcoming.includes(e))
    .sort((a, b) => (e2t(b) - e2t(a)));
  return { upcoming, previous };
}
const e2t = (e: PublicEvent) => (e.date ? new Date(e.date).getTime() : 0);

function useEvents() {
  const [events, setEvents] = useState<PublicEvent[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    listEvents()
      .then((l) => alive && setEvents(l))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);
  return { events, failed };
}

/** Event description from the admin app: clamped to a few lines, with Read more for long text. */
function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 150 || text.split('\n').length > 3;
  return (
    <div>
      <p className={`cbe-desc${open || !long ? ' full' : ''}`}>{text}</p>
      {long && (
        <button type="button" className="cbe-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

function EventCard({ e, past }: { e: PublicEvent; past: boolean }) {
  const d = e.date ? new Date(e.date) : null;
  const day = d ? d.toLocaleDateString('en-GB', { day: '2-digit', timeZone: 'Asia/Kolkata' }) : '';
  const month = d ? d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'Asia/Kolkata' }) : '';
  return (
    <article className={`cbe-card cbe-event cbe-photo-card${past ? ' closed' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cbe-tile-img" src={photoFor(e.eventCode).src} alt="" width={800} height={500} loading="lazy" decoding="async" />
      <div className="cbe-event-top">
        {d ? <span className="cbe-cal" aria-hidden="true"><b>{day}</b>{month}</span> : <span />}
        <span className={`cbe-status ${past ? 'closed' : 'open'}`}>{past ? 'Completed' : 'Registration open'}</span>
      </div>
      <h3>{e.name}</h3>
      <ul className="cbe-meta">
        {e.date && <li><span>Date</span>{formatDate(e.date)}</li>}
        {e.venue && <li><span>Venue</span>{e.venue}</li>}
        <li><span>By</span>{e.organizationName}</li>
      </ul>
      {e.description && <Description text={e.description} />}
      {!past && <Link className="cbe-btn small" href={`/register/${encodeURIComponent(e.eventCode)}`}>Register</Link>}
    </article>
  );
}

function Group({ title, list, past, empty, limit }: { title: string; list: PublicEvent[]; past: boolean; empty: string; limit?: number }) {
  const shown = limit ? list.slice(0, limit) : list;
  return (
    <div className="cbe-group">
      <h3 className="cbe-group-title">{title}</h3>
      {shown.length === 0 ? <p className="cbe-note left">{empty}</p> : (
        <div className="cbe-grid">{shown.map((e) => <EventCard key={e.eventCode} e={e} past={past} />)}</div>
      )}
    </div>
  );
}

/** Admin-created events as cards: "Upcoming" and "Previously". */
export function EventsBoard({ show = 'both', limit }: { show?: 'both' | 'upcoming' | 'previous'; limit?: number }) {
  const { events, failed } = useEvents();
  if (failed) return <p className="cbe-note" role="alert">We couldn&rsquo;t load events right now. Please try again shortly.</p>;
  if (!events) {
    return (
      <div className="cbe-grid" aria-busy="true" aria-label="Loading events">
        {[0, 1, 2].map((i) => <div key={i} className="cbe-card cbe-skel" />)}
      </div>
    );
  }
  const { upcoming, previous } = splitEvents(events);
  return (
    <>
      {show !== 'previous' && <Group title="Upcoming" list={upcoming} past={false} limit={limit} empty="No upcoming events right now. Check back soon." />}
      {show !== 'upcoming' && <Group title="Previously" list={previous} past limit={limit} empty="Completed events will appear here." />}
    </>
  );
}

/** Real numbers from the admin app: events held and certificates issued. Hidden until there is data. */
export function LiveStats() {
  const { events } = useEvents();
  if (!events || events.length === 0) return null;
  const { upcoming, previous } = splitEvents(events);
  const certs = events.reduce((n, e) => n + (e.certificateCount ?? 0), 0);
  const items = [
    { value: previous.length, label: 'Events completed', hint: 'Community actions delivered', icon: 'check' },
    { value: upcoming.length, label: 'Upcoming events', hint: 'Open for registration', icon: 'calendar' },
    { value: certs, label: 'Certificates issued', hint: 'Volunteers recognised', icon: 'award' },
  ] as const;
  return (
    <div className="cbe-stats" aria-label="Coimbatore impact">
      {items.map((s) => (
        <div key={s.label} className="cbe-stat">
          <span className={`cbe-stat-icon ${s.icon}`} aria-hidden="true"><StatIcon name={s.icon} /></span>
          <strong><CountUp to={s.value} /></strong>
          <span className="cbe-stat-label">{s.label}</span>
          <small>{s.hint}</small>
        </div>
      ))}
    </div>
  );
}

/** Counts up to `to` the first time it scrolls into view; shows the final number straight away without motion or IntersectionObserver. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || to === 0 || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(to);
      return;
    }
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1200);
        setN(Math.round(to * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <span ref={ref}>{n.toLocaleString('en-IN')}</span>;
}

function StatIcon({ name }: { name: 'check' | 'calendar' | 'award' }) {
  const p = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  if (name === 'check') return <svg {...p}><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M3 9.5h18M8 3v3M16 3v3M8.5 15l2.5 2.5 4.5-5" /></svg>;
  if (name === 'calendar') return <svg {...p}><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M3 9.5h18M8 3v3M16 3v3M12 13v4M10 15h4" /></svg>;
  return <svg {...p}><circle cx="12" cy="9" r="5.5" /><path d="M8.7 13.6 7.5 21l4.5-2.5 4.5 2.5-1.2-7.4M10 9l1.5 1.5L14.5 7.5" /></svg>;
}
