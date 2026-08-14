import matchupsData from '../data/matchups.json';
import typesData from '../data/types.json';
import type { TypeEn, MatchupResult, CategorizedMatchups, AttackResult, CategorizedAttackMatchups, PokemonType } from '../types';

const matchups = matchupsData as Record<TypeEn, Record<TypeEn, number>>;
const types = typesData as PokemonType[];

const typeByEn = new Map(types.map(t => [t.en, t]));

export function getMultiplier(attacker: TypeEn, defenderTypes: TypeEn[]): number {
  return defenderTypes.reduce((product, defender) => {
    const value = matchups[attacker]?.[defender];
    return product * (value ?? 1);
  }, 1);
}

export function computeMatchups(defenderTypes: TypeEn[]): MatchupResult[] {
  return types.map(type => {
    const multiplier = getMultiplier(type.en, defenderTypes);
    return {
      attacker: type.en,
      attackerFr: type.fr,
      multiplier
    };
  });
}

export function categorizeMatchups(matchupsList: MatchupResult[]): CategorizedMatchups {
  const result: CategorizedMatchups = {
    weakness4: [],
    weakness2: [],
    neutral: [],
    resistHalf: [],
    resistQuarter: [],
    immune: []
  };

  for (const m of matchupsList) {
    if (m.multiplier === 0) {
      result.immune.push(m);
    } else if (m.multiplier === 0.25) {
      result.resistQuarter.push(m);
    } else if (m.multiplier === 0.5) {
      result.resistHalf.push(m);
    } else if (m.multiplier === 1) {
      result.neutral.push(m);
    } else if (m.multiplier === 2) {
      result.weakness2.push(m);
    } else if (m.multiplier === 4) {
      result.weakness4.push(m);
    }
  }

  const sortByName = (a: MatchupResult, b: MatchupResult) => a.attackerFr.localeCompare(b.attackerFr);
  result.weakness4.sort(sortByName);
  result.weakness2.sort(sortByName);
  result.neutral.sort(sortByName);
  result.resistHalf.sort(sortByName);
  result.resistQuarter.sort(sortByName);
  result.immune.sort(sortByName);

  return result;
}

export function getTypeColor(typeEn: TypeEn): string {
  return typeByEn.get(typeEn)?.color ?? '#888888';
}

export function getTypeFr(typeEn: TypeEn): string {
  return typeByEn.get(typeEn)?.fr ?? typeEn;
}

export function getTypeByEn(en: TypeEn): PokemonType | undefined {
  return typeByEn.get(en);
}

export function computeAttackMatchups(attackerTypes: TypeEn[]): AttackResult[] {
  return types.map(type => {
    const multiplier = attackerTypes.reduce((product, attacker) => {
      return product * (matchups[attacker]?.[type.en] ?? 1);
    }, 1);
    return {
      defender: type.en,
      defenderFr: type.fr,
      multiplier
    };
  });
}

export function categorizeAttackMatchups(matchupsList: AttackResult[]): CategorizedAttackMatchups {
  const result: CategorizedAttackMatchups = {
    veryStrong: [],
    strong: [],
    neutral: [],
    weak: [],
    veryWeak: [],
    noEffect: []
  };

  for (const m of matchupsList) {
    if (m.multiplier === 0) {
      result.noEffect.push(m);
    } else if (m.multiplier === 0.25) {
      result.veryWeak.push(m);
    } else if (m.multiplier === 0.5) {
      result.weak.push(m);
    } else if (m.multiplier === 1) {
      result.neutral.push(m);
    } else if (m.multiplier === 2) {
      result.strong.push(m);
    } else if (m.multiplier === 4) {
      result.veryStrong.push(m);
    }
  }

  const sortByName = (a: AttackResult, b: AttackResult) => a.defenderFr.localeCompare(b.defenderFr);
  result.veryStrong.sort(sortByName);
  result.strong.sort(sortByName);
  result.neutral.sort(sortByName);
  result.weak.sort(sortByName);
  result.veryWeak.sort(sortByName);
  result.noEffect.sort(sortByName);

  return result;
}
