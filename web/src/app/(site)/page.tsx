import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'We The Leaders Coimbatore – Lead The Change',
  description: 'Join the We The Leaders community in Coimbatore: learn, serve and lead change in your city.',
  robots: { index: true, follow: true },
};

const highlights = [
  { label: 'Our focus', value: 'Leadership' },
  { label: 'Our spirit', value: 'Service' },
  { label: 'Our home', value: 'Coimbatore' },
  { label: 'Open to', value: 'Everyone' },
];

const pillars = [
  { title: 'Learn to lead', text: 'Workshops, talks and hands-on sessions that build confidence, communication and character.' },
  { title: 'Serve the city', text: 'Volunteer drives and community projects across Coimbatore, led by people who live here.' },
  { title: 'Grow together', text: 'A network of students, professionals and changemakers who back each other up.' },
];

const steps = [
  { title: 'Join the community', text: 'Register for an upcoming event and tell us what you care about.' },
  { title: 'Attend an event', text: 'Come to a Coimbatore meet-up, workshop or service drive.' },
  { title: 'Earn your certificate', text: 'Scan the QR code at the event to get your certificate instantly.' },
];

const explore = [
  { href: '/about', title: 'About us', text: 'Our story, values and who we welcome.' },
  { href: '/vision-mission', title: 'Vision & mission', text: 'Leadership at every level, and our values.' },
  { href: '/works', title: 'Our works', text: 'Drives, workshops and meet-ups across the city.' },
  { href: '/register', title: 'Event registration', text: 'Scan the QR code or enter your event code.' },
  { href: '/get-certificate', title: 'Certificates', text: 'Download or verify your certificate.' },
  { href: '/get-involved', title: 'Get involved', text: 'Volunteer, mentor or partner with us.' },
  { href: '/faq', title: 'FAQ', text: 'Answers to common questions.' },
];

export default function Home() {
  return (
    <>
      <section className="cbe-hero">
        <p className="cbe-eyebrow">Coimbatore chapter</p>
        <h1>Lead the change <em>in Coimbatore.</em></h1>
        <p className="cbe-lead">
          We The Leaders brings people together to learn, serve and lead, right here in the city we call home.
        </p>
        <div className="cbe-actions">
          <Link className="cbe-btn" href="/register">Join an event</Link>
          <Link className="cbe-btn ghost" href="/get-certificate">Get your certificate</Link>
        </div>
        <p className="cbe-tamil" lang="ta">#அறம் செய விரும்பு</p>
      </section>

      <section className="cbe-strip" aria-label="At a glance">
        {highlights.map((h) => (
          <div key={h.label}>
            <span>{h.label}</span>
            <strong>{h.value}</strong>
          </div>
        ))}
      </section>

      <section className="cbe-section">
        <h2>What we do</h2>
        <p className="cbe-sub">Three ways to be part of the change.</p>
        <div className="cbe-grid">
          {pillars.map((p, i) => (
            <article key={p.title} className="cbe-card">
              <span className="cbe-num">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cbe-section alt">
        <h2>How it works</h2>
        <ol className="cbe-steps">
          {steps.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cbe-section">
        <h2>Explore</h2>
        <p className="cbe-sub">Everything you need, a tap away.</p>
        <div className="cbe-grid">
          {explore.map((e) => (
            <Link key={e.href} href={e.href} className="cbe-card cbe-tile">
              <h3>{e.title}</h3>
              <p>{e.text}</p>
              <span className="cbe-link">Open &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="cbe-section">
        <div className="cbe-cta">
          <h2>Ready to lead the change?</h2>
          <p>Register for the next Coimbatore event and be part of the community.</p>
          <Link className="cbe-btn light" href="/register">Join an event</Link>
        </div>
      </section>
    </>
  );
}
