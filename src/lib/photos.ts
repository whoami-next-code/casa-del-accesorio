import type { CameraView } from './catalog';
import type { GaragePartId } from './garage';

export type PhotoSpot = { id: GaragePartId; x: number; y: number };

export type PhotoPlate = {
  id: CameraView;
  src: string;
  alt: string;
  spots: PhotoSpot[];
};

export const PHOTO_PLATES: PhotoPlate[] = [
  {
    id: 'orbit',
    src: '/photos/sedan-orbit.jpg',
    alt: 'Sedán tuneado de muestra en tres cuartos, kit completo',
    spots: [
      { id: 'spoiler', x: 13, y: 28 },
      { id: 'capo', x: 63, y: 38 },
      { id: 'luces', x: 78, y: 50 },
      { id: 'rines', x: 48, y: 68 },
      { id: 'splitter', x: 86, y: 76 },
      { id: 'faldones', x: 26, y: 70 },
    ],
  },
  {
    id: 'side',
    src: '/photos/sedan-side.jpg',
    alt: 'Sedán tuneado de muestra de perfil, kit completo',
    spots: [
      { id: 'spoiler', x: 88, y: 26 },
      { id: 'capo', x: 24, y: 42 },
      { id: 'luces', x: 13, y: 52 },
      { id: 'rines', x: 27, y: 64 },
      { id: 'splitter', x: 13, y: 68 },
      { id: 'faldones', x: 50, y: 67 },
      { id: 'difusor', x: 88, y: 64 },
      { id: 'escape', x: 93, y: 60 },
    ],
  },
  {
    id: 'rear',
    src: '/photos/sedan-rear.jpg',
    alt: 'Vista trasera del sedán tuneado: alerón, difusor y escape',
    spots: [
      { id: 'spoiler', x: 62, y: 20 },
      { id: 'rines', x: 22, y: 70 },
      { id: 'faldones', x: 14, y: 66 },
      { id: 'difusor', x: 64, y: 78 },
      { id: 'escape', x: 52, y: 76 },
    ],
  },
  {
    id: 'spoiler',
    src: '/photos/sedan-spoiler.jpg',
    alt: 'Detalle del alerón GT elevado sobre el maletero',
    spots: [{ id: 'spoiler', x: 58, y: 34 }],
  },
];

export function plateByView(view: CameraView) {
  return PHOTO_PLATES.find((plate) => plate.id === view) ?? PHOTO_PLATES[0];
}

export const SPIN_FRAMES = Array.from({ length: 36 }, (_, index) => `/photos/spin/${String(index).padStart(2, '0')}.jpg`);

const spinStatus = new Array<0 | 1 | 2 | 3>(SPIN_FRAMES.length).fill(0);
const spinWaiters: Array<Array<(ok: boolean) => void>> = SPIN_FRAMES.map(() => []);

export function spinFrameReady(index: number) {
  return spinStatus[wrapFrame(index)] === 2;
}

export function markSpinFrameReady(index: number) {
  const i = wrapFrame(index);
  if (spinStatus[i] === 2) return;
  spinStatus[i] = 2;
  const pending = spinWaiters[i];
  spinWaiters[i] = [];
  pending.forEach((fn) => fn(true));
}

export function markSpinFrameFailed(index: number) {
  const i = wrapFrame(index);
  if (spinStatus[i] === 2) return;
  spinStatus[i] = 3;
  const pending = spinWaiters[i];
  spinWaiters[i] = [];
  pending.forEach((fn) => fn(false));
}

export function preloadSpinFrame(index: number) {
  const i = wrapFrame(index);
  if (spinStatus[i] === 2) return Promise.resolve(true);
  if (spinStatus[i] === 3) return Promise.resolve(false);
  return new Promise<boolean>((resolve) => {
    spinWaiters[i].push(resolve);
    if (spinStatus[i] === 1) return;
    spinStatus[i] = 1;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      spinStatus[i] = 2;
      const pending = spinWaiters[i];
      spinWaiters[i] = [];
      pending.forEach((fn) => fn(true));
    };
    img.onerror = () => {
      spinStatus[i] = 3;
      const pending = spinWaiters[i];
      spinWaiters[i] = [];
      pending.forEach((fn) => fn(false));
    };
    img.src = SPIN_FRAMES[i];
  });
}

export function nearestReadySpinFrame(from: number, direction = 1) {
  const start = wrapFrame(from);
  if (spinStatus[start] === 2) return start;
  const dir = direction < 0 ? -1 : 1;
  for (let step = 1; step < SPIN_FRAMES.length; step += 1) {
    const i = wrapFrame(start + dir * step);
    if (spinStatus[i] === 2) return i;
  }
  return start;
}

export function preloadSpinSequence(center: number) {
  const total = SPIN_FRAMES.length;
  const seen = new Set<number>();
  const order: number[] = [];
  for (let distance = 0; distance < total; distance += 1) {
    for (const delta of distance === 0 ? [0] : [distance, -distance]) {
      const i = wrapFrame(center + delta);
      if (seen.has(i)) continue;
      seen.add(i);
      order.push(i);
    }
  }

  const pump = (start: number) => {
    if (start >= order.length) return;
    const batch = start < 5 ? 1 : 3;
    const slice = order.slice(start, start + batch);
    void Promise.all(slice.map(preloadSpinFrame)).then(() => {
      const next = () => pump(start + slice.length);
      if (start < 5) next();
      else if (typeof requestIdleCallback === 'function') requestIdleCallback(next, { timeout: 180 });
      else setTimeout(next, 24);
    });
  };

  pump(0);
}

export const VIEW_TO_FRAME: Record<CameraView, number> = {
  orbit: 5,
  side: 9,
  rear: 18,
  spoiler: 18,
};

export function wrapFrame(index: number) {
  const total = SPIN_FRAMES.length;
  return ((index % total) + total) % total;
}

type SpotMap = Partial<Record<GaragePartId, { x: number; y: number }>>;

const SPIN_KEYS: { frame: number; spots: SpotMap }[] = [
  {
    frame: 0,
    spots: {
      spoiler: { x: 50, y: 20 },
      capo: { x: 50, y: 42 },
      luces: { x: 68, y: 48 },
      splitter: { x: 50, y: 80 },
      rines: { x: 24, y: 82 },
    },
  },
  {
    frame: 5,
    spots: {
      luces: { x: 30, y: 54 },
      capo: { x: 34, y: 42 },
      splitter: { x: 16, y: 80 },
      rines: { x: 46, y: 72 },
      faldones: { x: 64, y: 70 },
      spoiler: { x: 86, y: 26 },
    },
  },
  {
    frame: 9,
    spots: {
      luces: { x: 13, y: 52 },
      capo: { x: 24, y: 42 },
      splitter: { x: 13, y: 68 },
      rines: { x: 27, y: 64 },
      faldones: { x: 50, y: 67 },
      spoiler: { x: 88, y: 26 },
      difusor: { x: 88, y: 64 },
      escape: { x: 93, y: 60 },
    },
  },
  {
    frame: 18,
    spots: {
      spoiler: { x: 50, y: 22 },
      difusor: { x: 50, y: 78 },
      escape: { x: 38, y: 76 },
      rines: { x: 28, y: 84 },
    },
  },
  {
    frame: 27,
    spots: {
      luces: { x: 87, y: 52 },
      capo: { x: 76, y: 42 },
      splitter: { x: 87, y: 68 },
      rines: { x: 73, y: 64 },
      faldones: { x: 50, y: 67 },
      spoiler: { x: 12, y: 26 },
      difusor: { x: 14, y: 64 },
      escape: { x: 10, y: 60 },
    },
  },
  {
    frame: 32,
    spots: {
      spoiler: { x: 14, y: 30 },
      capo: { x: 62, y: 40 },
      luces: { x: 78, y: 50 },
      rines: { x: 48, y: 70 },
      splitter: { x: 86, y: 78 },
      faldones: { x: 28, y: 70 },
    },
  },
];

export function spotsForFrame(index: number): PhotoSpot[] {
  const frame = wrapFrame(index);
  const total = SPIN_FRAMES.length;
  const keys = SPIN_KEYS;
  let slot = 0;
  for (let i = 0; i < keys.length; i += 1) {
    const start = keys[i].frame;
    const end = keys[(i + 1) % keys.length].frame;
    const inside = start < end ? frame >= start && frame < end : frame >= start || frame < end;
    if (inside) {
      slot = i;
      break;
    }
  }

  const from = keys[slot];
  const to = keys[(slot + 1) % keys.length];
  const span = (to.frame - from.frame + total) % total || total;
  const t = ((frame - from.frame + total) % total) / span;
  const ids = new Set([...Object.keys(from.spots), ...Object.keys(to.spots)]) as Set<string>;
  const spots: PhotoSpot[] = [];

  ids.forEach((key) => {
    const id = key as GaragePartId;
    const a = from.spots[id];
    const b = to.spots[id];
    if (a && b) {
      spots.push({ id, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      return;
    }
    if (a && t < 0.42) spots.push({ id, x: a.x, y: a.y });
    else if (b && t > 0.58) spots.push({ id, x: b.x, y: b.y });
  });

  return spots;
}
