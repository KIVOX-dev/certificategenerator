'use client';

export interface DayPoint { date: string; count: number }
export interface Slice { label: string; value: number; color: string }

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

/** Smooth monotone curve through the points (never dips below the data, so a wave of counts can't go negative). */
function smoothPath(pts: [number, number][]) {
  const n = pts.length;
  if (n < 2) return '';
  const dx: number[] = [], m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    m.push((pts[i + 1][1] - pts[i][1]) / dx[i]);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const aa = t[i] / m[i], bb = t[i + 1] / m[i], h = Math.hypot(aa, bb);
    if (h > 3) { t[i] = (3 * aa * m[i]) / h; t[i + 1] = (3 * bb * m[i]) / h; }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const c = dx[i] / 3;
    d += ` C${pts[i][0] + c},${pts[i][1] + t[i] * c} ${pts[i + 1][0] - c},${pts[i + 1][1] - t[i + 1] * c} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}

/** Wave chart of certificates issued per day: smooth line, soft fill, draws itself in. */
export function DailyChart({ data }: { data: DayPoint[] }) {
  const W = 640, H = 220, L = 34, R = 16, B = 26, T = 12;
  const max = Math.max(1, ...data.map((d) => d.count));
  const top = Math.max(4, Math.ceil(max / 4) * 4); // round the axis to a multiple of 4
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(1, data.length - 1);
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const total = data.reduce((s, d) => s + d.count, 0);
  const pts = data.map((d, i) => [x(i), y(d.count)] as [number, number]);
  const line = smoothPath(pts);
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`Certificates issued per day, last ${data.length} days: ${total} in total`}>
      <defs>
        <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#533afd" stopOpacity="0.28" />
          <stop offset="1" stopColor="#533afd" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => {
        const v = (top / 4) * i;
        return (
          <g key={i}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#eeecff" />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" className="axis">{v}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#waveFill)" className="wave-area" />
      <path d={line} fill="none" stroke="#533afd" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="wave-line" />
      {data.map((d, i) => (
        <g key={d.date}>
          {d.count > 0 && <circle cx={x(i)} cy={y(d.count)} r={3.5} fill="#fff" stroke="#533afd" strokeWidth="2" />}
          <circle cx={x(i)} cy={y(d.count)} r={Math.max(6, (W - L - R) / data.length / 2)} fill="transparent">
            <title>{`${shortDate(d.date)}: ${d.count}`}</title>
          </circle>
          {i % 5 === 0 || i === data.length - 1 ? (
            <text x={x(i)} y={H - 8} textAnchor={i === data.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'} className="axis">{shortDate(d.date)}</text>
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
        <circle cx="70" cy="70" r={R} fill="none" stroke="#eeecff" strokeWidth="18" />
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
