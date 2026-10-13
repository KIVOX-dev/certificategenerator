import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Get Involved – We The Leaders Coimbatore',
  description: 'Volunteer, mentor or partner with We The Leaders in Coimbatore.',
};

const involved = [
  { title: 'Volunteer', text: 'Help organise drives, welcome guests and run events on the day.' },
  { title: 'Speak or mentor', text: 'Share your story or skills with students and young leaders.' },
  { title: 'Partner with us', text: 'Colleges, companies and clubs can co-host events and programmes.' },
];

export default function GetInvolved() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">Get involved</p>
        <h1>However much time you have, there is a way to help.</h1>
      </section>

      <section className="cbe-section">
        <div className="cbe-grid">
          {involved.map((g) => (
            <article key={g.title} className="cbe-card">
              <h3>{g.title}</h3>
              <p>{g.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cbe-section">
        <div className="cbe-cta">
          <h2>Start with an event</h2>
          <p>The easiest way to get involved is to come along to the next Coimbatore event.</p>
          <Link className="cbe-btn light" href="/register">Join an event</Link>
        </div>
      </section>
    </>
  );
}
