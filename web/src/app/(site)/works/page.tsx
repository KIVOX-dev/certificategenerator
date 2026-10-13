import type { Metadata } from 'next';
import { links, stats, statsNote } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Our Works – We The Leaders',
  description: 'Monthly campaigns across Tamil Nadu and the impact they delivered.',
};

const themes = [
  {
    tag: 'Documented · Aug & Sep 2026',
    title: 'Clean and Sustainable Tamil Nadu',
    text: 'Leaders across Tamil Nadu came together for a cleaner, more sustainable future, turning one shared theme into visible local action.',
    href: links.themeClean,
    cta: 'Explore the completed theme',
  },
  {
    tag: 'Live now · October 2026',
    title: 'Women Safety and Empowerment',
    text: 'Chapters run women-led safety audits, rights and services clinics, and confidence-building sessions, then document what changed.',
    href: links.themeWomen,
    cta: 'Open campaign brief',
  },
  {
    tag: 'Upcoming · November 2026',
    title: 'Youth Skilling and Empowerment',
    text: 'Skills, mentoring and employment pathways for young people.',
    href: links.themeYouth,
    cta: 'Preview theme',
  },
];

export default function Works() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">Our works</p>
        <h1>One theme a month. Visible action. Measured impact.</h1>
        <p className="cbe-lead">
          Every month we bring people together around a single community action, then record what changed.
        </p>
      </section>

      <section className="cbe-section">
        <div className="cbe-grid">
          {themes.map((t) => (
            <article key={t.title} className="cbe-card">
              <span className="cbe-tag">{t.tag}</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <a className="cbe-link" href={t.href} target="_blank" rel="noopener noreferrer">{t.cta} &rarr;</a>
            </article>
          ))}
        </div>
      </section>

      <section className="cbe-section alt">
        <h2>Clean and Sustainable Tamil Nadu: the impact record</h2>
        <div className="cbe-strip">
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
    </>
  );
}
