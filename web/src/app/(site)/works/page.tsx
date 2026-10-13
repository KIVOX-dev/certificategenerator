import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Works – We The Leaders Coimbatore',
  description: 'What the Coimbatore community has been up to.',
};

// Placeholder entries: replace with the chapter's real projects.
const works = [
  { title: 'Community service drives', text: 'Clean-ups, donation drives and awareness campaigns across Coimbatore.' },
  { title: 'Leadership workshops', text: 'Hands-on sessions for students and young professionals.' },
  { title: 'City meet-ups', text: 'Open events where changemakers meet, share ideas and start projects.' },
];

export default function Works() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">Our works</p>
        <h1>What the Coimbatore community has been up to.</h1>
      </section>

      <section className="cbe-section">
        <div className="cbe-grid">
          {works.map((w) => (
            <article key={w.title} className="cbe-card">
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
