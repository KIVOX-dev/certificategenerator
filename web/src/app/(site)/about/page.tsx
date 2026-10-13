import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About – We The Leaders Coimbatore',
  description: 'Our story, values and who we welcome in Coimbatore.',
};

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

export default function About() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">About us</p>
        <h1>A city of leaders, one community at a time.</h1>
      </section>

      <section className="cbe-section">
        <div className="cbe-prose">
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
      </section>

      <section className="cbe-section alt">
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

      <section className="cbe-section">
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
    </>
  );
}
