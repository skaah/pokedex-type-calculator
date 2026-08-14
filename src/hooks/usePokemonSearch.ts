import { useMemo, useState } from 'react';
import pokedex from '../data/pokedex.json';
import type { Pokemon } from '../types';

const allPokemon = pokedex as Pokemon[];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function usePokemonSearch() {
  const [query, setQuery] = useState('');

  const suggestions = useMemo(() => {
    const normalizedQuery = normalize(query).trim();
    if (normalizedQuery.length === 0) return [];

    return allPokemon.filter(p => normalize(p.name).includes(normalizedQuery));
  }, [query]);

  const exactMatch = useMemo(() => {
    const normalizedQuery = normalize(query).trim();
    if (normalizedQuery.length === 0) return null;
    return allPokemon.find(p => normalize(p.name) === normalizedQuery) ?? null;
  }, [query]);

  return {
    query,
    setQuery,
    suggestions,
    exactMatch,
    allPokemon
  };
}
