import evolutionsData from '../data/evolutions.json';
import type { Pokemon, EvolutionData } from '../types';

const evolutions = evolutionsData as Record<string, EvolutionData>;

export function getEvolutionData(name: string): EvolutionData {
  return evolutions[name] ?? { previous: [], next: [] };
}

export function getPokemonByName(name: string, pokedex: Pokemon[]): Pokemon | undefined {
  return pokedex.find(p => p.name === name);
}

export function getVariants(pokemon: Pokemon, pokedex: Pokemon[]): Pokemon[] {
  return pokedex.filter(p => p.name === pokemon.name && p !== pokemon);
}

export function getEvolutionLinks(pokemon: Pokemon, pokedex: Pokemon[]): Pokemon[] {
  const data = getEvolutionData(pokemon.name);
  const links: Pokemon[] = [];

  for (const name of data.previous) {
    const found = getPokemonByName(name, pokedex);
    if (found) links.push(found);
  }

  for (const name of data.next) {
    const found = getPokemonByName(name, pokedex);
    if (found) links.push(found);
  }

  return links;
}
