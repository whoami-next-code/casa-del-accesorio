'use client';

import { plateByView } from '@/lib/photos';
import type { CameraView } from '@/lib/catalog';
import type { GaragePartId } from '@/lib/garage';
import PhotoHotspot from './PhotoHotspot';

export default function PhotoStage({
  view,
  selected,
  published,
  onPick,
}: {
  view: CameraView;
  selected: GaragePartId | null;
  published: boolean;
  onPick: (id: GaragePartId) => void;
}) {
  const plate = plateByView(view);

  return (
    <div className="absolute inset-0 grid place-items-center px-4 stage-well">
      <div className="stage-glow" aria-hidden />
      <div className="stage-floor" aria-hidden />
      <div className="relative z-[1] w-full max-h-full aspect-video">
        <img src={plate.src} alt={plate.alt} className="h-full w-full object-contain" />
        {published &&
          plate.spots.map((spot) => (
            <PhotoHotspot
              key={spot.id}
              id={spot.id}
              x={spot.x}
              y={spot.y}
              selected={selected === spot.id}
              onPick={onPick}
            />
          ))}
      </div>
      <div className="stage-vignette" aria-hidden />
    </div>
  );
}
