import type { Metadata } from 'next';
import Link from 'next/link';
import { EventsBoard, LiveStats } from '@/components/EventsBoard';
import { FaqLoop } from '@/components/FaqLoop';
import { approach, faqs, links, steps } from '@/lib/site';

export const metadata: Metadata = {
  title: 'We The Leaders Coimbatore – Local action. Measurable change.',
  description:
    'We The Leaders brings people together around one community action every month, then measures and shares what changed. Join the Coimbatore constituency.',
  robots: { index: true, follow: true },
};

const explore = [
  { href: '/vision-mission', title: 'Vision & mission', text: 'Leadership at every level, and the values behind it.' },
  { href: '/works', title: 'Our works', text: 'Monthly campaigns and the impact they delivered.' },
  { href: '/register', title: 'Event registration', text: 'Scan the QR code or enter your event code.' },
  { href: '/get-certificate', title: 'Certificates', text: 'Download or verify your certificate.' },
  { href: '/get-involved', title: 'Get involved', text: 'Join the movement and take part in the next action.' },
];

export default function Home() {
  return (
    <>
      <section className="cbe-hero">
        <p className="cbe-eyebrow">Coimbatore constituency</p>
        <h1>Local action. <em>Measurable change.</em></h1>
        <p className="cbe-lead">
          We The Leaders brings people together around one community action every month, then measures and shares what
          changed. Be part of it in Coimbatore.
        </p>
        <div className="cbe-actions">
          <a className="cbe-btn" href={links.join} target="_blank" rel="noopener noreferrer">Join the Movement</a>
          <Link className="cbe-btn ghost" href="/register">Find an event</Link>
        </div>
        <p className="cbe-tamil" lang="ta">#அறம் செய விரும்பு</p>
      </section>

      <section id="events" className="cbe-section">
        <p className="cbe-eyebrow">Coimbatore events</p>
        <h2>What’s happening in Coimbatore</h2>
        <p className="cbe-sub">Upcoming events you can join, and what we did previously.</p>
        <EventsBoard limit={3} />
        <p className="cbe-center"><Link className="cbe-btn small" href="/register">See all events</Link></p>
      </section>

      <section className="cbe-section alt">
        <p className="cbe-eyebrow">Impact, not activity</p>
        <h2>We measure impact, not activity</h2>
        <p className="cbe-sub">
          Every action uses one simple record: the problem, who took part, what changed, the evidence, and what happens
          next.
        </p>
        <LiveStats />
      </section>

      <section className="cbe-section">
        <p className="cbe-eyebrow">Conscious Constituency Approach</p>
        <h2>Leadership rooted in the community</h2>
        <p className="cbe-sub">
          Governance built on conscious leadership, community engagement and data-driven decisions, bridging technology
          and human-centric leadership so development is inclusive and sustainable in every constituency.
        </p>
        <div className="cbe-grid">
          {approach.map((a, i) => (
            <article key={a.title} className="cbe-card">
              <span className="cbe-num">0{i + 1}</span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
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
              <span className="cbe-btn small">Open</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="cbe-section">
        <div className="cbe-cta">
          <h2>Ready to lead the change?</h2>
          <p>Join the movement, find your constituency and take part in the next action. Follow our field updates on Instagram.</p>
          <div className="cbe-actions">
            <a className="cbe-btn light" href={links.join} target="_blank" rel="noopener noreferrer">Join the Movement</a>
            <a className="cbe-btn outline-light" href={links.instagram} target="_blank" rel="noopener noreferrer">@wetheleadersfoundation</a>
          </div>
        </div>
      </section>

      <section id="faq" className="cbe-section alt">
        <h2>Frequently asked questions</h2>
        <FaqLoop items={faqs} />
      </section>
    </>
  );
}
