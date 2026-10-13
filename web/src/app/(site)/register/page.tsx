import type { Metadata } from 'next';
import { HomeEntry } from '@/components/HomeEntry';

export const metadata: Metadata = {
  title: 'Event Registration – We The Leaders Coimbatore',
  description: 'Register for a We The Leaders event in Coimbatore.',
};

export default function Register() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">Event registration</p>
        <h1>Join an event.</h1>
        <p className="cbe-lead">Scan the QR code at the venue or enter your event code to register.</p>
      </section>

      <section className="cbe-section">
        <div className="cbe-register">
          <HomeEntry />
        </div>
      </section>
    </>
  );
}
