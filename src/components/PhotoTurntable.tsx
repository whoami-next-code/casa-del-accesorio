'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SPIN_FRAMES,
  markSpinFrameFailed,
  markSpinFrameReady,
  nearestReadySpinFrame,
  preloadSpinFrame,
  preloadSpinSequence,
  spinFrameReady,
  spotsForFrame,
  wrapFrame,
} from '@/lib/photos';
import type { GaragePartId } from '@/lib/garage';
import PhotoHotspot from './PhotoHotspot';

const PIXELS_PER_FRAME = 12;
const AUTO_FRAMES_PER_SEC = 4.5;
const DRAG_LOCK = 8;
const INERTIA_MIN = 0.05;

export default function PhotoTurntable({
  frame,
  spinning,
  paintHex,
  published,
  selected,
  onPick,
  onInteract,
}: {
  frame: number;
  spinning: boolean;
  paintHex: string;
  published: boolean;
  selected: GaragePartId | null;
  onPick: (id: GaragePartId) => void;
  onInteract: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const angle = useRef(frame);
  const shownRef = useRef(wrapFrame(frame));
  const velocity = useRef(0);
  const dragging = useRef(false);
  const axis = useRef<'wait' | 'h' | 'v' | null>(null);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastDir = useRef(1);
  const pendingDx = useRef(0);
  const dragRaf = useRef(0);
  const loopRaf = useRef(0);
  const loopOn = useRef(false);
  const spinningRef = useRef(spinning);
  const reduceMotion = useRef(false);
  const alive = useRef(true);
  const gen = useRef(0);
  const front = useRef(0);
  const imgA = useRef<HTMLImageElement>(null);
  const imgB = useRef<HTMLImageElement>(null);
  const startSrc = SPIN_FRAMES[wrapFrame(frame)];

  const [ready, setReady] = useState(() => spinFrameReady(frame));
  const [shown, setShown] = useState(() => wrapFrame(frame));
  const [grabbing, setGrabbing] = useState(false);
  const [hint, setHint] = useState(true);
  const tint = paintHex.toLowerCase() !== '#f4f6f8';
  const spots = spotsForFrame(shown);

  spinningRef.current = spinning;

  const imgs = () => [imgA.current, imgB.current] as const;

  const commitShown = (index: number) => {
    if (shownRef.current === index) return;
    shownRef.current = index;
    if (!dragging.current) setShown(index);
  };

  const paint = useCallback((index: number) => {
    const wanted = wrapFrame(Math.round(index));
    const show = spinFrameReady(wanted) ? wanted : nearestReadySpinFrame(wanted, lastDir.current);
    void preloadSpinFrame(wanted + lastDir.current);
    void preloadSpinFrame(wanted + lastDir.current * 2);
    if (!spinFrameReady(wanted)) {
      void preloadSpinFrame(wanted).then((ok) => {
        if (!alive.current || !ok) return;
        if (wrapFrame(Math.round(angle.current)) === wanted) paint(wanted);
      });
    }
    if (!spinFrameReady(show)) return;

    const nodes = imgs();
    const vis = nodes[front.current];
    const hid = nodes[1 - front.current];
    if (!vis || !hid) return;
    if (vis.dataset.frame === String(show)) {
      commitShown(show);
      return;
    }

    const token = ++gen.current;
    let applied = false;
    const apply = () => {
      if (applied || !alive.current || token !== gen.current) return;
      applied = true;
      hid.onload = null;
      hid.style.opacity = '1';
      vis.style.opacity = '0';
      hid.dataset.frame = String(show);
      front.current = 1 - front.current;
      commitShown(show);
    };

    if (hid.dataset.frame === String(show) && hid.complete && hid.naturalWidth > 0) {
      apply();
      return;
    }

    hid.onload = apply;
    hid.onerror = () => {
      if (token !== gen.current) return;
      hid.onload = null;
      markSpinFrameFailed(show);
    };
    hid.src = SPIN_FRAMES[show];
    if (hid.complete && hid.naturalWidth > 0) apply();
  }, []);

  const stopLoop = () => {
    loopOn.current = false;
    if (loopRaf.current) cancelAnimationFrame(loopRaf.current);
    loopRaf.current = 0;
  };

  const startLoop = useCallback(() => {
    if (loopOn.current) return;
    loopOn.current = true;
    let last = performance.now();
    const tick = (now: number) => {
      if (!alive.current || dragging.current) {
        loopOn.current = false;
        loopRaf.current = 0;
        return;
      }
      const dt = Math.min(0.048, (now - last) / 1000);
      last = now;
      let next = angle.current;
      if (spinningRef.current && !reduceMotion.current) {
        next += dt * AUTO_FRAMES_PER_SEC;
        velocity.current = 0;
        lastDir.current = 1;
      } else if (!reduceMotion.current && Math.abs(velocity.current) > INERTIA_MIN) {
        next += velocity.current;
        lastDir.current = velocity.current < 0 ? -1 : 1;
        velocity.current *= 0.9;
      } else {
        velocity.current = 0;
        angle.current = wrapFrame(Math.round(next));
        paint(angle.current);
        stopLoop();
        return;
      }
      angle.current = next;
      paint(next);
      loopRaf.current = requestAnimationFrame(tick);
    };
    loopRaf.current = requestAnimationFrame(tick);
  }, [paint]);

  const flushDrag = useCallback(() => {
    dragRaf.current = 0;
    const dx = pendingDx.current;
    pendingDx.current = 0;
    if (!dx) return;
    const step = -dx / PIXELS_PER_FRAME;
    lastDir.current = step < 0 ? -1 : 1;
    angle.current += step;
    paint(angle.current);
  }, [paint]);

  const endDrag = useCallback(() => {
    if (axis.current === null && !dragging.current) return;
    const wasDragging = dragging.current;
    dragging.current = false;
    axis.current = null;
    if (root.current) root.current.style.touchAction = '';
    setGrabbing(false);
    if (dragRaf.current) {
      cancelAnimationFrame(dragRaf.current);
      flushDrag();
    }
    setShown(shownRef.current);
    if (wasDragging && !reduceMotion.current && Math.abs(velocity.current) > INERTIA_MIN) {
      startLoop();
    }
  }, [flushDrag, startLoop]);

  useEffect(() => {
    alive.current = true;
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = wrapFrame(frame);
    const first = imgA.current;
    if (first?.complete && first.naturalWidth > 0) {
      markSpinFrameReady(start);
      setReady(true);
    }
    void preloadSpinFrame(start).then((ok) => {
      if (!alive.current) return;
      if (ok) {
        setReady(true);
        paint(start);
      }
    });
    preloadSpinSequence(start);
    const release = () => endDrag();
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    return () => {
      alive.current = false;
      stopLoop();
      if (dragRaf.current) cancelAnimationFrame(dragRaf.current);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
    };
    // First mount only: sequence cache lives at module level.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dragging.current) return;
    angle.current = frame;
    velocity.current = 0;
    void preloadSpinFrame(frame).then((ok) => {
      if (!alive.current || !ok) return;
      setReady(true);
      paint(frame);
    });
  }, [frame, paint]);

  useEffect(() => {
    if (spinning && !reduceMotion.current) startLoop();
  }, [spinning, startLoop]);

  useEffect(() => {
    void preloadSpinFrame(shown + 1);
    void preloadSpinFrame(shown - 1);
  }, [shown]);

  const recoverFrom = (index: number) => {
    markSpinFrameFailed(index);
    const fallback = nearestReadySpinFrame(index + 1, 1);
    if (spinFrameReady(fallback)) {
      setReady(true);
      paint(fallback);
      return;
    }
    void preloadSpinFrame(index + 1).then((ok) => {
      if (!alive.current || !ok) return;
      setReady(true);
      paint(index + 1);
    });
  };

  const stepBy = (delta: number) => {
    if (!ready) return;
    velocity.current = 0;
    lastDir.current = delta < 0 ? -1 : 1;
    angle.current = wrapFrame(Math.round(angle.current) + delta);
    paint(angle.current);
    onInteract();
    setHint(false);
  };

  return (
    <div
      ref={root}
      className="turntable absolute inset-0 grid place-items-center px-4 select-none stage-well"
      data-grabbing={grabbing}
      onPointerDown={(event) => {
        if (!ready || event.button !== 0) return;
        axis.current = 'wait';
        dragging.current = false;
        lastX.current = event.clientX;
        lastY.current = event.clientY;
        velocity.current = 0;
        pendingDx.current = 0;
      }}
      onPointerMove={(event) => {
        if (axis.current === null) return;
        const dx = event.clientX - lastX.current;
        const dy = event.clientY - lastY.current;
        if (axis.current === 'wait') {
          if (Math.hypot(dx, dy) < DRAG_LOCK) return;
          if (Math.abs(dx) > Math.abs(dy) * 1.15) {
            axis.current = 'h';
            dragging.current = true;
            event.currentTarget.style.touchAction = 'none';
            setGrabbing(true);
            setHint(false);
            onInteract();
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              /* capture is optional on some browsers */
            }
          } else {
            axis.current = 'v';
            return;
          }
        }
        if (axis.current !== 'h') return;
        event.preventDefault();
        pendingDx.current += dx;
        velocity.current = -dx / PIXELS_PER_FRAME;
        lastX.current = event.clientX;
        lastY.current = event.clientY;
        if (!dragRaf.current) dragRaf.current = requestAnimationFrame(flushDrag);
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      role="group"
      aria-label="Visor 360 del sedán de muestra"
    >
      <div className="stage-glow" aria-hidden />
      <div className="stage-floor" aria-hidden />
      <div className="relative z-[1] w-full max-h-full aspect-video">
        <img
          ref={imgA}
          src={startSrc}
          alt=""
          draggable={false}
          decoding="async"
          fetchPriority="high"
          data-frame={String(wrapFrame(frame))}
          className="turntable-frame"
          style={{ opacity: 1 }}
          onLoad={(event) => {
            const i = Number(event.currentTarget.dataset.frame);
            if (Number.isFinite(i)) markSpinFrameReady(i);
            setReady(true);
          }}
          onError={(event) => {
            const i = Number(event.currentTarget.dataset.frame);
            if (Number.isFinite(i)) recoverFrom(i);
          }}
        />
        <img
          ref={imgB}
          alt=""
          draggable={false}
          decoding="async"
          className="turntable-frame"
          style={{ opacity: 0 }}
          onLoad={(event) => {
            const i = Number(event.currentTarget.dataset.frame);
            if (Number.isFinite(i)) markSpinFrameReady(i);
          }}
          onError={(event) => {
            const i = Number(event.currentTarget.dataset.frame);
            if (Number.isFinite(i)) markSpinFrameFailed(i);
          }}
        />
        {tint && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-color opacity-45"
            style={{ background: paintHex }}
          />
        )}
        {published &&
          ready &&
          spots.map((spot) => (
            <PhotoHotspot
              key={spot.id}
              id={spot.id}
              x={spot.x}
              y={spot.y}
              selected={selected === spot.id}
              onPick={onPick}
            />
          ))}
        {ready && (
          <>
            <button
              type="button"
              className="turntable-step left-1"
              aria-label="Girar a la izquierda"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => stepBy(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="turntable-step right-1"
              aria-label="Girar a la derecha"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => stepBy(1)}
            >
              ›
            </button>
          </>
        )}
        {!ready && (
          <p className="turntable-load" role="status">
            Cargando vista 360°
          </p>
        )}
        {ready && hint && (
          <p className="turntable-hint" aria-hidden>
            Arrastra para explorar
          </p>
        )}
      </div>
      <div className="stage-vignette" aria-hidden />
    </div>
  );
}
