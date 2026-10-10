import { useEffect } from 'react';

const ORANGE = 'M76 372C120 354 152 346 165 322C171 298 175 278 179 262C196 304 216 346 250 382C200 374 130 366 76 372Z';
const GREEN = 'M205 125C183 178 192 245 242 312L265 382L288 312C338 245 347 178 325 125C331 188 312 250 265 302C218 250 199 188 205 125Z';
const BLUE = 'M454 372C410 354 378 346 365 322C359 298 355 278 351 262C334 304 314 346 280 382C330 374 400 366 454 372Z';
const LOOP_MS = 2600;

type Keys = [number, number][];
/** Linear interpolation through [time 0..1, value] keyframes. */
function at(keys: Keys, t: number) {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return t1 === t0 ? v1 : v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
}

// Same timeline as the on-page bloom animation (see globals.css).
const ALPHA: Keys = [[0, 0], [0.1, 1], [0.82, 1], [1, 0]];
const CENTER_SCALE: Keys = [[0, 0], [0.35, 1.08], [0.45, 1], [1, 1]];
const SIDE_SCALE: Keys = [[0, 0], [0.12, 0], [0.5, 1.05], [0.6, 1], [1, 1]];
const SIDE_ROT: Keys = [[0, 40], [0.12, 40], [0.5, 3], [0.6, 0], [1, 0]]; // degrees, mirrored for the left figure
const HEAD_SCALE: Keys = [[0, 0], [0.3, 0], [0.55, 1.25], [0.65, 1], [1, 1]];

function drawFrame(ctx: CanvasRenderingContext2D, size: number, now: number) {
  const k = (size * 0.9) / 410;
  const t = (now % LOOP_MS) / LOOP_MS;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size * 0.05 - 60 * k, size * 0.12 - 100 * k + 8 * k);
  ctx.scale(k, k);
  const figure = (d: string, color: string, scale: number, rotDeg: number, head: [number, number, number, string]) => {
    ctx.save();
    ctx.globalAlpha = at(ALPHA, t);
    ctx.translate(265, 400); // bloom from the base centre
    ctx.rotate((rotDeg * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-265, -400);
    ctx.fillStyle = color;
    ctx.fill(new Path2D(d));
    const [cx, cy, r, headColor] = head;
    const hs = at(HEAD_SCALE, t);
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r * hs, 0, 7);
    ctx.fill();
    ctx.restore();
  };
  const side = at(SIDE_SCALE, t);
  const rot = at(SIDE_ROT, t);
  figure(ORANGE, '#e8832a', side, -rot, [148, 321, 17, '#ee8c2b']);
  figure(BLUE, '#2a7fc0', side, rot, [382, 321, 17, '#2a86c4']);
  figure(GREEN, '#4f9a38', at(CENTER_SCALE, t), 0, [265, 210, 33, '#6fb23a']);
  ctx.restore();
}

/** Animates the browser-tab icon while a loader is on screen, then restores the normal icon. */
export function useLoadingFavicon() {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
    const original = links.map((l) => l.href);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx || !links.length) return;
    const tick = () => {
      drawFrame(ctx, 64, performance.now());
      const url = canvas.toDataURL('image/png');
      for (const l of links) l.href = url;
    };
    tick();
    const id = window.setInterval(tick, 90);
    return () => {
      window.clearInterval(id);
      links.forEach((l, i) => { l.href = original[i]; });
    };
  }, []);
}
