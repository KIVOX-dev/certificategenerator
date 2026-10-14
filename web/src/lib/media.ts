// Field photos and videos for the public site (sourced from wetheleader.org). Files live in /public/works.

export const workPhotos = [
  { src: '/works/p01.jpg', alt: "Opening of the Tamizhagam Vizhithezhum Maanadu stage" },
  { src: '/works/p02.jpg', alt: "Volunteers on a clean-up walk in Kanyakumari" },
  { src: '/works/p03.jpg', alt: "A packed hall of leaders and volunteers" },
  { src: '/works/p04.jpg', alt: "Field action in the rain" },
  { src: '/works/p05.jpg', alt: "We The Leaders branded stage" },
  { src: '/works/p06.jpg', alt: "Volunteers cleaning the Sothavilai coast" },
  { src: '/works/p07.jpg', alt: "The crowd taking the pledge together" },
  { src: '/works/p08.jpg', alt: "Speaking on the beach" },
  { src: '/works/p09.jpg', alt: "Addressing the crowd from the stage" },
  { src: '/works/p10.jpg', alt: "Aerial view of a river and bridges" },
  { src: '/works/p11.jpg', alt: "The crowd responding" },
  { src: '/works/p12.jpg', alt: "Speaking at the We The Leaders podium" },
  { src: '/works/p13.jpg', alt: "Front row pledge" },
  { src: '/works/p14.jpg', alt: "Plastic wrappers collected during a clean-up" },
  { src: '/works/p15.jpg', alt: "Young leaders on stage" },
  { src: '/works/p16.jpg', alt: "Speaking at the podium" },
  { src: '/works/p17.jpg', alt: "Crowd at the barricade" },
  { src: '/works/p18.jpg', alt: "Speaker at the podium" },
  { src: '/works/p19.jpg', alt: "Address from the stage" },
  { src: '/works/p20.jpg', alt: "Speaker and the crowd" },
] as const;

/** Stable pick from the pool, so a given event or card always shows the same photo. */
export function photoFor(key: string, offset = 0) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return workPhotos[(h + offset) % workPhotos.length];
}

export type WorkVideo =
  | { kind: 'file'; src: string; poster: string; title: string; text: string }
  | { kind: 'youtube'; id: string; title: string; text: string };

export const workVideos: WorkVideo[] = [
  { kind: 'file', src: '/hero/hero.mp4', poster: '/hero/hero-poster.jpg', title: 'Community clean-up in action', text: 'Volunteers clearing waste and restoring a local waterway.' },
  { kind: 'youtube', id: 'qxFZlTa_FbM', title: 'Join hands for a clean and sustainable Tamil Nadu', text: 'The August environment awareness campaign.' },
  { kind: 'youtube', id: 'YzKyxmLEJOo', title: 'Drug-free Tamil Nadu awareness conference', text: 'Highlights from the We The Leaders conference, 12 July 2026.' },
];
