import type { Metadata } from 'next';
import Link from 'next/link';
import { HomeEntry } from '@/components/HomeEntry';
import { LandingNav } from '@/components/LandingNav';
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

const works = [
  { title: 'Community service drives', text: 'Clean-ups, donation drives and awareness campaigns across Coimbatore.' },
  { title: 'Leadership workshops', text: 'Hands-on sessions for students and young professionals.' },
  { title: 'City meet-ups', text: 'Open events where changemakers meet, share ideas and start projects.' },
];

export default function Home() {
  return (
    <div className="cbe">
      <header className="cbe-nav">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="We The Leaders" width={168} height={37} />
        <LandingNav mainSite={MAIN_SITE} />
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

      <section id="works" className="cbe-section">
        <h2>Our works</h2>
        <p className="cbe-sub">What the Coimbatore community has been up to.</p>
        <div className="cbe-grid">
          {works.map((w) => (
            <article key={w.title} className="cbe-card">
              <h3>{w.title}</h3>
              <p>{w.text}</p>
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

      <section id="register" className="cbe-section">
        <div className="cbe-register">
          <h2>Event registration</h2>
          <p className="cbe-sub">Joining an event? Scan the QR code at the venue or enter your event code to register.</p>
          <HomeEntry />
        </div>
      </section>

      <section id="certificates" className="cbe-section">
        <div className="cbe-cta">
          <h2>Certificates</h2>
          <p>Scan the QR code shown at your event, or enter the event code, to get your certificate. Already have one? Scan its QR code to verify it.</p>
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
