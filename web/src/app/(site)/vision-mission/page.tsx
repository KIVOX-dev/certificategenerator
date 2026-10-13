import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vision & Mission – We The Leaders',
  description: 'Leadership lives in everyone. Our vision, mission, values and focus areas.',
};

// Wording taken from wetheleader.org/vision-mission.
const values = [
  { title: 'Empowerment through action', text: 'We equip individuals and communities to take ownership of their growth and create lasting change.' },
  { title: 'Collective growth', text: 'We foster inclusion and shared progress, ensuring every voice is heard and every need is considered.' },
  { title: 'Sustainability for future generations', text: 'We place environmental and social sustainability at the heart of every initiative.' },
  { title: 'Collaboration and innovation', text: 'We bring people and ideas together to develop practical, forward-looking solutions.' },
];

const focus = [
  { title: 'Nurturing change agents', text: 'Helping people turn purpose into responsible leadership and measurable action.' },
  { title: 'Healthy society', text: 'Supporting stronger, more inclusive communities where people can thrive.' },
  { title: 'Sustainable ecosystem', text: 'Encouraging environmental responsibility and action that protects our shared future.' },
  { title: 'Economic upliftment', text: 'Creating pathways to skills, livelihoods and long-term economic progress.' },
  { title: 'Empowerment', text: 'Equipping individuals with the confidence, knowledge and opportunity to lead.' },
];

export default function VisionMission() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">About us</p>
        <h1>Leadership lives in everyone.</h1>
        <p className="cbe-lead">
          Founded in 2020, We The Leaders helps people recognise and strengthen the leadership qualities already within
          them. We believe everyone has the potential to lead. Through practical guidance, opportunity and collective
          action, we help individuals contribute meaningfully to their communities and to national development.
        </p>
        <div className="cbe-actions">
          <a className="cbe-btn ghost" href="#vision">Our purpose</a>
          <a className="cbe-btn ghost" href="#values">Explore our values</a>
        </div>
      </section>

      <section id="vision" className="cbe-section">
        <div className="cbe-vm">
          <article className="cbe-vm-card">
            <span className="cbe-vm-letter" aria-hidden="true">V</span>
            <p className="cbe-num">01 · Our vision</p>
            <h2>Leadership at every level</h2>
            <p>
              To build a society where leadership thrives at every level—advancing innovation, responsibility and shared
              progress towards a stronger, more prosperous nation.
            </p>
          </article>
          <article id="mission" className="cbe-vm-card alt">
            <span className="cbe-vm-letter" aria-hidden="true">M</span>
            <p className="cbe-num">02 · Our mission</p>
            <h2>Potential into progress</h2>
            <p>
              To unlock leadership potential through mentorship, guidance and meaningful opportunities, enabling people to
              create positive change, foster innovation and contribute to national development.
            </p>
          </article>
        </div>
      </section>

      <section id="values" className="cbe-section alt">
        <h2>Principles that guide our work</h2>
        <p className="cbe-sub">Our values shape how we work with individuals, communities and partners.</p>
        <div className="cbe-grid four">
          {values.map((v, i) => (
            <article key={v.title} className="cbe-card flat">
              <span className="cbe-num">0{i + 1}</span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="focus" className="cbe-section">
        <h2>Where leadership creates change</h2>
        <p className="cbe-sub">Five connected areas guide our programmes and partnerships.</p>
        <div className="cbe-grid">
          {focus.map((f, i) => (
            <article key={f.title} className="cbe-card">
              <span className="cbe-num">0{i + 1}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
