export const CARS_META_ID = '__car_jobs__';
export const CARS_META_SKU = '__CAR_JOBS__';

export type CarJob = {
  id: string;
  title: string;
  car: string;
  year: string;
  blurb: string;
  mods: string[];
  cover: string;
  photos: string[];
  videos: string[];
  published: boolean;
};

export function emptyCar(): CarJob {
  const stamp = Date.now().toString(36);
  return {
    id: `auto-${stamp}`,
    title: '',
    car: '',
    year: '',
    blurb: '',
    mods: [],
    cover: '',
    photos: [],
    videos: [],
    published: true,
  };
}

export function carCover(job: CarJob) {
  return job.cover || job.photos[0] || '';
}

export function normalizeCar(raw: Partial<CarJob> | null): CarJob {
  const fallback = emptyCar();
  return {
    id: String(raw?.id || fallback.id),
    title: String(raw?.title || ''),
    car: String(raw?.car || ''),
    year: String(raw?.year || ''),
    blurb: String(raw?.blurb || ''),
    mods: Array.isArray(raw?.mods) ? raw.mods.map(String).filter(Boolean) : [],
    cover: String(raw?.cover || ''),
    photos: Array.isArray(raw?.photos) ? raw.photos.map(String).filter(Boolean) : [],
    videos: Array.isArray(raw?.videos) ? raw.videos.map(String).filter(Boolean) : [],
    published: raw?.published !== false,
  };
}
