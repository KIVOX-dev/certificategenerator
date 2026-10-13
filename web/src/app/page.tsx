import type { Metadata } from 'next';
import Link from 'next/link';
import './coimbatore.css';

export const metadata: Metadata = {
  title: 'We The Leaders Coimbatore – Lead The Change',
  description: 'Join the We The Leaders community in Coimbatore: learn, serve and lead change in your city.',
  robots: { index: true, follow: true },
};

// Edit the copy below. Nothing here is pulled from wetheleaders.org, so check it against the main site.
const MAIN_SITE = 'https://wetheleaders.org';

const pillars = [
  { title: 'Learn to lead', text: 'Workshops, talks and hands-on sessions that build confidence, communication and character.' },
  { title: 'Serve the city', text: 'Volunteer drives and community projects across Coimbatore, led by people who live here.' },
  { title: 'Grow together', text: 'A network of students, professionals and changemakers who back each other up.' },
];

const steps = [
  { title: 'Join the community', text: 'Sign up on our main site and tell us what you care about.' },
  { title: 'Attend an event', text: 'Come to a Coimbatore meet-up, workshop or service drive.' },
  { title: 'Earn your certificate', text: 'Scan the QR code at the event to get your certificate instantly.' },
];

export default function Home() {
  return (
    <div className="cbe">
      <header className="cbe-nav">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="We The Leaders" width={168} height={37} />
        <nav aria-label="Page sections">
          <a href="#about">About</a>
          <a href="#how">How it works</a>
          <a href="#certificate">Certificate</a>
          <a className="cbe-btn small" href={MAIN_SITE}>Join</a>
        </nav>
      </header>

      <section className="cbe-hero">
        <p className="cbe-eyebrow">Coimbatore chapter</p>
        <h1>Lead the change <em>in Coimbatore.</em></h1>
        <p className="cbe-lead">
          We The Leaders brings people together to learn, serve and lead, right here in the city we call home.
        </p>
        <div className="cbe-actions">
          <a className="cbe-btn" href={MAIN_SITE}>Join We The Leaders</a>
          <Link className="cbe-btn ghost" href="/get-certificate">Get your certificate</Link>
        </div>
        <p className="cbe-tamil" lang="ta">#அறம் செய விரும்பு</p>
      </section>

      <section id="about" className="cbe-section">
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

      <section id="how" className="cbe-section alt">
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

      <section id="certificate" className="cbe-section">
        <div className="cbe-cta">
          <h2>Attended an event?</h2>
          <p>Scan the QR code shown at your event, or enter the event code, to get your certificate.</p>
          <Link className="cbe-btn light" href="/get-certificate">Get my certificate</Link>
        </div>
      </section>

      <footer className="cbe-footer">
        <span>© We The Leaders · Coimbatore</span>
        <a href={MAIN_SITE}>wetheleaders.org</a>
      </footer>
    </div>
  );
}
