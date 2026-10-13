import type { Metadata } from 'next';
import Link from 'next/link';
import { links } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Get Involved – We The Leaders',
  description: 'Join the movement, find your constituency and take part in the next action.',
};

export default function GetInvolved() {
  return (
    <>
      <section className="cbe-pagehead">
        <p className="cbe-eyebrow">Get involved</p>
        <h1>Join your local team.</h1>
        <p className="cbe-lead">Three ways to start, whatever time you have.</p>
      </section>

      <section className="cbe-section">
        <div className="cbe-grid">
          <article className="cbe-card">
            <span className="cbe-num">01</span>
            <h3>Join the movement</h3>
            <p>Sign up and find your constituency.</p>
            <a className="cbe-link" href={links.join} target="_blank" rel="noopener noreferrer">Join the Movement &rarr;</a>
          </article>
          <article className="cbe-card">
            <span className="cbe-num">02</span>
            <h3>Find an event</h3>
            <p>Scan the QR code at the venue or enter your event code to register.</p>
            <Link className="cbe-link" href="/register">Register for an event &rarr;</Link>
          </article>
          <article className="cbe-card">
            <span className="cbe-num">03</span>
            <h3>Get the app</h3>
            <p>Find your constituency and join the next action from your phone.</p>
            <span className="cbe-linkrow">
              <a className="cbe-link" href={links.appStore} target="_blank" rel="noopener noreferrer">App Store</a>
              <a className="cbe-link" href={links.playStore} target="_blank" rel="noopener noreferrer">Google Play</a>
            </span>
          </article>
        </div>
      </section>

      <section className="cbe-section">
        <div className="cbe-cta">
          <h2>Follow the movement</h2>
          <p>Recent field updates, campaign stories and community action, on Instagram.</p>
          <a className="cbe-btn outline-light" href={links.instagram} target="_blank" rel="noopener noreferrer">@wetheleadersfoundation</a>
        </div>
      </section>
    </>
  );
}
