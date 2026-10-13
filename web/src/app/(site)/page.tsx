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

const works = [
  { title: 'Community service drives', text: 'Clean-ups, donation drives and awareness campaigns across Coimbatore.' },
  { title: 'Leadership workshops', text: 'Hands-on sessions for students and young professionals.' },
  { title: 'City meet-ups', text: 'Open events where changemakers meet, share ideas and start projects.' },
];

const values = [
  { title: 'Integrity', text: 'We do what we say and own what we do, in small things and big ones.' },
  { title: 'Service first', text: 'Leadership means showing up for others. Our name for it is அறம், doing good.' },
  { title: 'Inclusion', text: 'Every background, college, profession and age is welcome at our table.' },
  { title: 'Action', text: 'Ideas matter, but we measure ourselves by what actually changes on the ground.' },
];

const audiences = [
  { title: 'Students', text: 'Build confidence, meet mentors and turn classroom ideas into real projects.' },
  { title: 'Professionals', text: 'Give back with your skills, grow your network and lead teams beyond the office.' },
  { title: 'Volunteers', text: 'Pick a cause, join a drive and see the difference your time makes.' },
  { title: 'Organisations', text: 'Partner with us to host events, sponsor programmes or reach the community.' },
];

const steps = [
  { title: 'Join the community', text: 'Register for an upcoming event and tell us what you care about.' },
  { title: 'Attend an event', text: 'Come to a Coimbatore meet-up, workshop or service drive.' },
  { title: 'Earn your certificate', text: 'Scan the QR code at the event to get your certificate instantly.' },
];

const involved = [
  { title: 'Volunteer', text: 'Help organise drives, welcome guests and run events on the day.' },
  { title: 'Speak or mentor', text: 'Share your story or skills with students and young leaders.' },
  { title: 'Partner with us', text: 'Colleges, companies and clubs can co-host events and programmes.' },
];

const faqs = [
  { q: 'Who can join We The Leaders in Coimbatore?', a: 'Anyone who wants to learn, serve and lead. Students, professionals, homemakers and retirees are all welcome.' },
  { q: 'Is there a fee to join?', a: 'Please check the main site or the event page for the latest details, as some events may differ.' },
  { q: 'How do I register for an event?', a: 'Scan the QR code displayed at the venue, or enter the event code in the Event Registration section above.' },
  { q: 'How do I get my certificate?', a: 'After registering at an event, enter your name and phone number to download your certificate instantly. You can also share it from the same page.' },
  { q: 'How can I check that a certificate is genuine?', a: 'Every certificate carries a QR code. Scanning it opens a verification page that shows the recipient, course and issue date.' },
  { q: 'I lost my certificate. What do I do?', a: 'Enter the same phone number you registered with on the certificate page and we will show your existing certificate.' },
];

export default function Home() {
  return (
    <div className="cbe">
      <header className="cbe-nav">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="We The Leaders" width={168} height={37} />
        <LandingNav />
      </header>

      <section className="cbe-hero">
        <p className="cbe-eyebrow">Coimbatore chapter</p>
        <h1>Lead the change <em>in Coimbatore.</em></h1>
        <p className="cbe-lead">
          We The Leaders brings people together to learn, serve and lead, right here in the city we call home.
        </p>
        <div className="cbe-actions">
          <a className="cbe-btn" href="#register">Join an event</a>
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

      <section id="about" className="cbe-section">
        <div className="cbe-split">
          <div>
            <p className="cbe-eyebrow">About us</p>
            <h2>A city of leaders, one community at a time.</h2>
          </div>
          <div>
            <p>
              We The Leaders is a community that believes leadership is not a title; it is a habit of caring and acting.
              In Coimbatore, we bring students, professionals and neighbours together to learn new skills, serve those who
              need support and take on the challenges of our city.
            </p>
            <p>
              Our Tamil tagline says it best: <span lang="ta" className="cbe-inline-ta">அறம் செய விரும்பு</span>,
              &ldquo;desire to do good&rdquo;. Everything we organise starts there.
            </p>
          </div>
        </div>
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

      <section id="values" className="cbe-section alt">
        <h2>What we stand for</h2>
        <p className="cbe-sub">The values behind everything we organise.</p>
        <div className="cbe-grid four">
          {values.map((v) => (
            <article key={v.title} className="cbe-card flat">
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="who" className="cbe-section">
        <h2>Who it&rsquo;s for</h2>
        <p className="cbe-sub">There is a place for you here.</p>
        <div className="cbe-grid four">
          {audiences.map((a) => (
            <article key={a.title} className="cbe-card">
              <h3>{a.title}</h3>
              <p>{a.text}</p>
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

      <section id="involved" className="cbe-section">
        <h2>Get involved</h2>
        <p className="cbe-sub">However much time you have, there is a way to help.</p>
        <div className="cbe-grid">
          {involved.map((g) => (
            <article key={g.title} className="cbe-card">
              <h3>{g.title}</h3>
              <p>{g.text}</p>
              <a className="cbe-link" href="#register">Join an event &rarr;</a>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="cbe-section alt">
        <h2>Frequently asked questions</h2>
        <div className="cbe-faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cbe-section">
        <div className="cbe-cta">
          <h2>Ready to lead the change?</h2>
          <p>Register for the next Coimbatore event and be part of the community.</p>
          <a className="cbe-btn light" href="#register">Join an event</a>
        </div>
      </section>

      <footer className="cbe-footer">
        <div className="cbe-foot-brand">
          <strong>We The Leaders · Coimbatore</strong>
          <span lang="ta">#அறம் செய விரும்பு</span>
        </div>
        <nav aria-label="Footer" className="cbe-foot-links">
          <a href="#about">About</a>
          <a href="#works">Our Works</a>
          <a href="#register">Event Registration</a>
          <a href="#certificates">Certificates</a>
          <a href="#faq">FAQ</a>
        </nav>
        <small>© We The Leaders. All rights reserved.</small>
      </footer>
    </div>
  );
}
