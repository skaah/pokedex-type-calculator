import { useState, useEffect, useRef, useCallback } from 'react';
import type { Pokemon } from '../types';

interface FloatingSprite {
  id: number;
  pokemon: Pokemon;
  x: number;
  y: number;
  size: number;
  duration: number;
}

interface FloatingSpritesProps {
  pokedex: Pokemon[];
  mainRef?: React.RefObject<HTMLElement>;
  maxSprites?: number;
}

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getMainRect(mainRef?: React.RefObject<HTMLElement>): DOMRect | null {
  if (!mainRef?.current) return null;
  return mainRef.current.getBoundingClientRect();
}

function pickScreenPosition(mainRect: DOMRect | null): { x: number; y: number } {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const margin = 24;

  // If main ref is missing, fall back to full screen edges
  if (!mainRect) {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: return { x: random(0, width), y: random(0, height * 0.15) };
      case 1: return { x: random(0, width), y: random(height * 0.85, height) };
      case 2: return { x: random(0, width * 0.15), y: random(0, height) };
      default: return { x: random(width * 0.85, width), y: random(0, height) };
    }
  }

  const left = mainRect.left - margin;
  const right = mainRect.right + margin;
  const top = mainRect.top - margin;
  const bottom = mainRect.bottom + margin;

  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: // above main
      return { x: random(0, width), y: random(0, Math.max(0, top)) };
    case 1: // below main
      return { x: random(0, width), y: random(bottom, height) };
    case 2: // left of main
      return { x: random(0, Math.max(0, left)), y: random(top, bottom) };
    default: // right of main
      return { x: random(right, width), y: random(top, bottom) };
  }
}

export function FloatingSprites({ pokedex, mainRef, maxSprites = 12 }: FloatingSpritesProps) {
  const [sprites, setSprites] = useState<FloatingSprite[]>([]);
  const idRef = useRef(0);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const spawn = useCallback(() => {
    if (pokedex.length === 0) return;

    const pokemon = pokedex[Math.floor(Math.random() * pokedex.length)];
    if (!pokemon.sprite) return;

    const mainRect = getMainRect(mainRef);
    const pos = pickScreenPosition(mainRect);
    const sprite: FloatingSprite = {
      id: idRef.current++,
      pokemon,
      x: pos.x,
      y: pos.y,
      size: Math.floor(random(52, 88)),
      duration: random(5, 9),
    };

    setSprites(prev => {
      const next = [...prev, sprite];
      if (next.length > maxSprites) {
        return next.slice(next.length - maxSprites);
      }
      return next;
    });

    const timeout = setTimeout(() => {
      setSprites(prev => prev.filter(s => s.id !== sprite.id));
      timeoutsRef.current.delete(timeout);
    }, sprite.duration * 1000);
    timeoutsRef.current.add(timeout);
  }, [pokedex, mainRef, maxSprites]);

  useEffect(() => {
    const interval = setInterval(() => spawn(), random(600, 1100));
    spawn();

    return () => {
      clearInterval(interval);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current.clear();
    };
  }, [spawn]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {sprites.map(sprite => (
        <img
          key={sprite.id}
          src={sprite.pokemon.sprite!}
          alt=""
          className="absolute animate-float-sprite opacity-0"
          style={{
            left: `${sprite.x}px`,
            top: `${sprite.y}px`,
            width: `${sprite.size}px`,
            height: `${sprite.size}px`,
            transform: 'translate(-50%, -50%)',
            ['--duration' as string]: `${sprite.duration}s`,
          }}
          loading="lazy"
        />
      ))}
    </div>
  );
}
