import type { Metadata } from 'next';
import { EventsBoard, LiveStats } from '@/components/EventsBoard';
import { PhotoMarquee, VideoGallery } from '@/components/WorkMedia';

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

      <section className="cbe-section wide">
        <p className="cbe-eyebrow">On the ground</p>
        <h2>Moments from our work</h2>
        <p className="cbe-sub">Clean-ups, conferences and community pledges across Tamil Nadu.</p>
        <PhotoMarquee />
      </section>

      <section className="cbe-section">
        <EventsBoard />
      </section>

      <section className="cbe-section alt">
        <p className="cbe-eyebrow">Watch</p>
        <h2>Our work on video</h2>
        <p className="cbe-sub">See the movement in action.</p>
        <VideoGallery />
      </section>
    </>
  );
}
