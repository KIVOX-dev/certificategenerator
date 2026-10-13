'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatDate, listEvents, type PublicEvent } from '@/lib/api';

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
    <article className={`cbe-card cbe-event${past ? ' closed' : ''}`}>
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
    { value: String(previous.length), label: 'events completed' },
    { value: String(upcoming.length), label: 'upcoming events' },
    { value: certs.toLocaleString('en-IN'), label: 'certificates issued' },
  ];
  return (
    <div className="cbe-strip" aria-label="Coimbatore impact">
      {items.map((s) => (
        <div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>
      ))}
    </div>
  );
}
