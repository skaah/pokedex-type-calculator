import pokemonInfoData from '../data/pokemon-info.json';
import type { PokemonInfo, PokemonInfoMap, PokemonLocation } from '../types';

const infoMap: PokemonInfoMap = pokemonInfoData as PokemonInfoMap;

export function getPokemonInfo(name: string): PokemonInfo | null {
  return infoMap[name] || null;
}

export function groupLocationsByMethod(locations: PokemonLocation[]) {
  const grouped: Record<string, PokemonLocation[]> = {};
  for (const loc of locations) {
    if (!grouped[loc.method]) {
      grouped[loc.method] = [];
    }
    grouped[loc.method].push(loc);
  }
  return grouped;
}

export function formatMethodName(method: string) {
  switch (method) {
    case 'level-up': return 'Montée de niveau';
    case 'machine': return 'CT / Capsule';
    case 'tutor': return 'Tuteur';
    case 'egg': return 'Oeuf';
    default: return method;
  }
}
