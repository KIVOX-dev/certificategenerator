import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ – We The Leaders Coimbatore',
  description: 'Answers to common questions about events, registration and certificates.',
};

const faqs = [
  { q: 'Who can join We The Leaders in Coimbatore?', a: 'Anyone who wants to learn, serve and lead. Students, professionals, homemakers and retirees are all welcome.' },
  { q: 'Is there a fee to join?', a: 'Please check the event page for the latest details, as some events may differ.' },
  { q: 'How do I register for an event?', a: 'Scan the QR code displayed at the venue, or enter the event code on the Event Registration page.' },
  { q: 'How do I get my certificate?', a: 'After registering at an event, enter your name and phone number to download your certificate instantly. You can also share it from the same page.' },
  { q: 'How can I check that a certificate is genuine?', a: 'Every certificate carries a QR code. Scanning it opens a verification page that shows the recipient, course and issue date.' },
  { q: 'I lost my certificate. What do I do?', a: 'Enter the same phone number you registered with on the certificate page and we will show your existing certificate.' },
];

export default function Faq() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">FAQ</p>
        <h1>Frequently asked questions.</h1>
      </section>

      <section className="cbe-section">
        <div className="cbe-faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
