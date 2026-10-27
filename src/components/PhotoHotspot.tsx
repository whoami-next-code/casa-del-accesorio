'use client';

import { partById, type GaragePartId } from '@/lib/garage';

export default function PhotoHotspot({
  id,
  x,
  y,
  selected,
  onPick,
}: {
  id: GaragePartId;
  x: number;
  y: number;
  selected: boolean;
  onPick: (id: GaragePartId) => void;
}) {
  const part = partById(id);

  return (
    <button
      type="button"
      className="hotspot"
      style={{ left: `${x}%`, top: `${y}%` }}
      data-active={selected}
      aria-label={part.name}
      onClick={(event) => {
        event.stopPropagation();
        onPick(id);
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span className="hotspot-pulse" aria-hidden />
      <span className="hotspot-core" aria-hidden />
      <span className="hotspot-label">{part.name}</span>
    </button>
  );
}
