'use client';

import { useEffect, useState } from 'react';

type Faq = { q: string; a: string };

const INTERVAL_MS = 5000;

export function FaqLoop({ items }: { items: Faq[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Restarts whenever `active` changes, so a manual click resets the 5s timer.
  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % items.length), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [active, paused, items.length]);

  return (
    <div
      className="cbe-faq"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {items.map((f, i) => {
        const open = i === active;
        return (
          <div key={f.q} className={`cbe-faq-item${open ? ' open' : ''}`}>
            <h3>
              <button type="button" aria-expanded={open} onClick={() => setActive(i)}>
                {f.q}
              </button>
            </h3>
            <div className="cbe-faq-body" aria-hidden={!open}>
              <p>{f.a}</p>
            </div>
            {open && !paused && <span className="cbe-faq-bar" style={{ animationDuration: `${INTERVAL_MS}ms` }} />}
          </div>
        );
      })}
    </div>
  );
}
