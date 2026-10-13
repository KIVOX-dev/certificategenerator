import type { Metadata } from 'next';
import Link from 'next/link';
import { approach, links, stats, statsNote, steps, upcoming } from '@/lib/site';

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
  { href: '/faq', title: 'FAQ', text: 'Answers to common questions.' },
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
        <p className="cbe-count"><strong>19,40,000</strong> leaders registered so far</p>
        <p className="cbe-tamil" lang="ta">#அறம் செய விரும்பு</p>
      </section>

      <section className="cbe-section tight" aria-labelledby="up-h">
        <h2 id="up-h" className="cbe-h-sm">Coming up across Tamil Nadu</h2>
        <ul className="cbe-events">
          {upcoming.map((e) => (
            <li key={e.title}>
              <span className="cbe-date">{e.date}</span>
              <div>
                <span className="cbe-tag">{e.tag}</span>
                <h3>{e.title}</h3>
                <p>{e.place}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="cbe-section">
        <div className="cbe-theme">
          <div>
            <p className="cbe-eyebrow light">This month · October 2026</p>
            <h2>A safer Tamil Nadu, led by women</h2>
            <p>
              Every chapter runs a women-led safety audit, builds awareness and opens pathways to rights, confidence and
              opportunity, then returns to document what changed.
            </p>
            <div className="cbe-actions left">
              <a className="cbe-btn light" href={links.themeWomen} target="_blank" rel="noopener noreferrer">Open campaign brief</a>
              <Link className="cbe-btn outline-light" href="/register">See events</Link>
            </div>
          </div>
          <aside className="cbe-next">
            <span>Next · November 2026</span>
            <strong>Youth Skilling and Empowerment</strong>
            <em>Skills, mentoring &amp; employment</em>
            <a href={links.themeYouth} target="_blank" rel="noopener noreferrer">Preview theme &rarr;</a>
          </aside>
        </div>
      </section>

      <section className="cbe-section alt">
        <p className="cbe-eyebrow">Impact, not activity</p>
        <h2>We measure impact, not activity</h2>
        <p className="cbe-sub">
          Every action uses one simple record: the problem, who took part, what changed, the evidence, and what happens
          next.
        </p>
        <div className="cbe-strip" aria-label="Campaign impact">
          {stats.map((s) => (
            <div key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <p className="cbe-note">{statsNote}</p>
        <p className="cbe-center">
          <a className="cbe-link" href={links.impact} target="_blank" rel="noopener noreferrer">Explore the impact report &rarr;</a>
        </p>
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
        <div className="cbe-app">
          <div>
            <p className="cbe-eyebrow">Mobile app</p>
            <h2>Get We The Leaders on your phone</h2>
            <p>Find your constituency and join the next action.</p>
          </div>
          <div className="cbe-actions left">
            <a className="cbe-btn" href={links.appStore} target="_blank" rel="noopener noreferrer">App Store</a>
            <a className="cbe-btn" href={links.playStore} target="_blank" rel="noopener noreferrer">Google Play</a>
          </div>
        </div>
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
          <p>Join the movement, find your constituency and take part in the next action. Follow our field updates on Instagram.</p>
          <div className="cbe-actions">
            <a className="cbe-btn light" href={links.join} target="_blank" rel="noopener noreferrer">Join the Movement</a>
            <a className="cbe-btn outline-light" href={links.instagram} target="_blank" rel="noopener noreferrer">@wetheleadersfoundation</a>
          </div>
        </div>
      </section>
    </>
  );
}
