// Field photos and videos for the public site (sourced from wetheleader.org). Files live in /public/works.

export const workPhotos = [
  { src: '/works/p21.jpg', alt: "Bags of collected waste after the clean-up" },
  { src: '/works/p22.jpg', alt: "Volunteers collecting waste beside a tin wall" },
  { src: '/works/p23.jpg', alt: "Volunteers clearing waste on a hillside road" },
  { src: '/works/p24.jpg', alt: "Young volunteers with filled waste bags on the rocks" },
  { src: '/works/p25.jpg', alt: "Volunteers of all ages collecting litter along a road" },
  { src: '/works/p26.jpg', alt: "Briefing the volunteers before the clean-up" },
  { src: '/works/p27.jpg', alt: "Team members arriving for the clean-up drive" },
  { src: '/works/p28.jpg', alt: "The volunteer team at the temple gate" },
  { src: '/works/p29.jpg', alt: "Volunteers with filled bags after the drive" },
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
  { src: '/works/p15.jpg', alt: "Young leaders on stage" },
  { src: '/works/p16.jpg', alt: "Speaking at the podium" },
  { src: '/works/p17.jpg', alt: "Crowd at the barricade" },
  { src: '/works/p18.jpg', alt: "Speaker at the podium" },
  { src: '/works/p19.jpg', alt: "Address from the stage" },
  { src: '/works/p20.jpg', alt: "Speaker and the crowd" },
] as const;

/** Stable pick from the pool (or a subset of it), so a given key always shows the same photo. */
export function photoFor(key: string, subset?: readonly number[]) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const idx = subset?.length ? subset[h % subset.length] : h % workPhotos.length;
  return workPhotos[idx];
}

// Indices into workPhotos by theme.
const MAIN = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // the clean-up drive photos: the site's main photos
const CLEANUP = [...MAIN, 14, 10]; // then the coast clean-up and walk
const STAGE = [9, 11, 13, 15, 17, 19, 22, 24, 26, 27]; // conferences, pledges, stage and crowd shots
const SPEAKER = [16, 20, 23, 25];

/** Event photo that fits what the event is about, judged from its name and description. */
export function eventPhoto(e: { eventCode: string; name: string; description?: string }) {
  const text = `${e.name} ${e.description ?? ''}`.toLowerCase();
  if (/clean|waste|plastic|garbage|litter|trash|coast|beach|river|pond|lake|canal|nature|environment|tree|plant|green/.test(text)) return photoFor(e.eventCode, CLEANUP);
  if (/conference|maanadu|pledge|rally|award|inaugur|convention|summit/.test(text)) return photoFor(e.eventCode, STAGE);
  if (/talk|speech|address|session|workshop|seminar|lecture/.test(text)) return photoFor(e.eventCode, SPEAKER);
  return photoFor(e.eventCode, MAIN);
}

export type WorkVideo =
  | { kind: 'file'; src: string; poster: string; title: string; text: string }
  | { kind: 'youtube'; id: string; title: string; text: string };

export const workVideos: WorkVideo[] = [
  { kind: 'file', src: '/hero/hero.mp4', poster: '/hero/hero-poster.jpg', title: 'Community clean-up in action', text: 'Volunteers clearing waste and restoring a local waterway.' },
  { kind: 'youtube', id: 'qxFZlTa_FbM', title: 'Join hands for a clean and sustainable Tamil Nadu', text: 'The August environment awareness campaign.' },
  { kind: 'youtube', id: 'YzKyxmLEJOo', title: 'Drug-free Tamil Nadu awareness conference', text: 'Highlights from the We The Leaders conference, 12 July 2026.' },
];

/** Main photos by file name, so cards don't depend on the order of the pool. */
export const mainPhoto = (file: string) => workPhotos.find((p) => p.src === `/works/${file}`) ?? workPhotos[0];
