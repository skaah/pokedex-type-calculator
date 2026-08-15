export type TypeEn =
  | 'NORMAL' | 'FIRE' | 'WATER' | 'ELECTRIC' | 'GRASS' | 'ICE'
  | 'FIGHTING' | 'POISON' | 'GROUND' | 'FLYING' | 'PSYCHIC' | 'BUG'
  | 'ROCK' | 'GHOST' | 'DRAGON' | 'DARK' | 'STEEL' | 'FAIRY';

export interface PokemonType {
  id: number;
  en: TypeEn;
  fr: string;
  color: string;
}

export interface Pokemon {
  name: string;
  type1: TypeEn;
  type2: TypeEn | null;
  sprite: string | null;
}

export interface MatchupResult {
  attacker: TypeEn;
  attackerFr: string;
  multiplier: number;
}

export interface CategorizedMatchups {
  weakness4: MatchupResult[];
  weakness2: MatchupResult[];
  neutral: MatchupResult[];
  resistHalf: MatchupResult[];
  resistQuarter: MatchupResult[];
  immune: MatchupResult[];
}

export interface AttackResult {
  defender: TypeEn;
  defenderFr: string;
  multiplier: number;
}

export interface CategorizedAttackMatchups {
  veryStrong: AttackResult[]; // ×4
  strong: AttackResult[];      // ×2
  neutral: AttackResult[];      // ×1
  weak: AttackResult[];         // ×0.5
  veryWeak: AttackResult[];     // ×0.25
  noEffect: AttackResult[];     // ×0
}

export interface EvolutionData {
  previous: string[];
  next: string[];
}

export interface EvolutionLink {
  pokemon: Pokemon;
  direction: 'previous' | 'next' | 'variant';
}

export interface PokemonLevelMove {
  name: string;
  en: string;
  level: number | null;
}

export interface PokemonSimpleMove {
  name: string;
}

export interface EvolutionStep {
  name: string;
  method: string;
  condition: string | null;
}

export interface PokemonLocation {
  zone: string;
  method: string;
  note: string | null;
}

export interface PokemonMoves {
  level_up: PokemonLevelMove[];
  egg: PokemonSimpleMove[];
}

export interface PokemonEvolution {
  from: string | null;
  to: EvolutionStep[];
}

export interface PokemonInfo {
  evolution: PokemonEvolution;
  moves: PokemonMoves;
  heldItems: string[];
  addedMoves: string[];
  locations: PokemonLocation[];
}

export type PokemonInfoMap = Record<string, PokemonInfo>;

