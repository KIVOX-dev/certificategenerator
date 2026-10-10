'use client';

export interface DayPoint { date: string; count: number }
export interface Slice { label: string; value: number; color: string }

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

/** Bar chart of certificates issued per day. */
export function DailyChart({ data }: { data: DayPoint[] }) {
  const W = 640, H = 220, L = 34, B = 26, T = 10;
  const max = Math.max(1, ...data.map((d) => d.count));
  const top = Math.max(4, Math.ceil(max / 4) * 4); // round the axis to a multiple of 4
  const bw = (W - L) / data.length;
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`Certificates issued per day, last ${data.length} days: ${total} in total`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const v = (top / 4) * i;
        return (
          <g key={i}>
            <line x1={L} x2={W} y1={y(v)} y2={y(v)} stroke="#e5e7eb" />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" className="axis">{v}</text>
          </g>
        );
      })}
      {data.map((d, i) => (
        <g key={d.date}>
          <rect x={L + i * bw + bw * 0.15} y={y(d.count)} width={bw * 0.7} height={H - B - y(d.count)} rx={2} fill="#0b4f9c">
            <title>{`${shortDate(d.date)}: ${d.count}`}</title>
          </rect>
          {i % 5 === 0 || i === data.length - 1 ? (
            <text x={L + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="axis">{shortDate(d.date)}</text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

/** Donut chart with a legend; the legend carries the numbers so colour is never the only signal. */
export function Donut({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const R = 52, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" role="img" aria-label={slices.map((s) => `${s.label} ${s.value}`).join(', ')}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="#e5e7eb" strokeWidth="18" />
        {total > 0 && slices.filter((s) => s.value > 0).map((s) => {
          const len = (s.value / total) * C;
          const el = (
            <circle key={s.label} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="18"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)">
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
        <text x="70" y="68" textAnchor="middle" className="donut-total">{total}</text>
        <text x="70" y="86" textAnchor="middle" className="axis">total</text>
      </svg>
      <ul className="legend">
        {slices.map((s) => (
          <li key={s.label}><i style={{ background: s.color }} />{s.label}<b>{s.value}</b></li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal bars, e.g. certificates per event. */
export function HBars({ rows }: { rows: { name: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return <p className="muted">No certificates yet.</p>;
  return (
    <ul className="hbars">
      {rows.map((r) => (
        <li key={r.name}>
          <span className="hb-name" title={r.name}>{r.name}</span>
          <span className="hb-track"><span style={{ width: `${(r.count / max) * 100}%` }} /></span>
          <b>{r.count}</b>
        </li>
      ))}
    </ul>
  );
}
