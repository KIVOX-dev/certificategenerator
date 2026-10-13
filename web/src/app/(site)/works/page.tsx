import type { Metadata } from 'next';
import { EventsBoard, LiveStats } from '@/components/EventsBoard';

export const metadata: Metadata = {
  title: 'Our Works – We The Leaders Coimbatore',
  description: 'What We The Leaders has done in Coimbatore, and what is coming next.',
};

export default function Works() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">Our works</p>
        <h1>What we have done in Coimbatore.</h1>
        <p className="cbe-lead">Every event is recorded here: what we did, where, and who took part.</p>
      </section>

      <section className="cbe-section">
        <LiveStats />
      </section>

      <section className="cbe-section">
        <EventsBoard />
      </section>
    </>
  );
}
