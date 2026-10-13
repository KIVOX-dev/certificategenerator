import type { Metadata } from 'next';
import { EventsBoard } from '@/components/EventsBoard';
import { HomeEntry } from '@/components/HomeEntry';

export const metadata: Metadata = {
  title: 'Event Registration – We The Leaders Coimbatore',
  description: 'Find an upcoming We The Leaders event and register.',
};

export default function Register() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">Event registration</p>
        <h1>Find an event.</h1>
        <p className="cbe-lead">Pick an event below to register, or scan the QR code at the venue.</p>
      </section>

      <section className="cbe-section">
        <EventsBoard />
      </section>

      <section className="cbe-section alt">
        <h2>Have an event code?</h2>
        <p className="cbe-sub">Scan the QR code at the venue or type the code to register directly.</p>
        <div className="cbe-register">
          <HomeEntry />
        </div>
      </section>
    </>
  );
}
