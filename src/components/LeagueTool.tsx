import { useState } from 'react';
import { PokemonSearch } from './PokemonSearch';
import { LeagueRow } from './LeagueRow';
import { TypeBadge } from './TypeBadge';
import { getMultiplier } from '../utils/matchups';
import type { Pokemon, TypeEn } from '../types';

interface LeagueToolProps {
  team: Pokemon[];
  myTeam: Pokemon[];
  query: string;
  setQuery: (value: string) => void;
  suggestions: Pokemon[];
  onAdd: (pokemon: Pokemon) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  onAddMyTeam: (pokemon: Pokemon) => void;
  onRemoveMyTeam: (index: number) => void;
  onClearMyTeam: () => void;
}

function getMatchupDetails(myPokemon: Pokemon, opponent: Pokemon): { type: TypeEn; score: number }[] {
  const opponentTypes = opponent.type2
    ? [opponent.type1, opponent.type2]
    : [opponent.type1];
  const myTypes = myPokemon.type2
    ? [myPokemon.type1, myPokemon.type2]
    : [myPokemon.type1];

  return myTypes.map(type => ({
    type: type as TypeEn,
    score: getMultiplier(type as TypeEn, opponentTypes as TypeEn[])
  }));
}

function getBestScore(matchups: { type: TypeEn; score: number }[]): number {
  return Math.max(...matchups.map(m => m.score));
}

function findBestMatchup(myTeam: Pokemon[], opponent: Pokemon): { pokemon: Pokemon; matchups: { type: TypeEn; score: number }[] } | null {
  if (myTeam.length === 0) return null;

  let best: { pokemon: Pokemon; matchups: { type: TypeEn; score: number }[] } | null = null;
  let bestScore = 0;

  for (const myPokemon of myTeam) {
    const matchups = getMatchupDetails(myPokemon, opponent);
    const score = getBestScore(matchups);
    if (!best || score > bestScore) {
      best = { pokemon: myPokemon, matchups };
      bestScore = score;
    }
  }
  return best;
}

export function LeagueTool({
  team,
  myTeam,
  query,
  setQuery,
  suggestions,
  onAdd,
  onRemove,
  onClear,
  onAddMyTeam,
  onRemoveMyTeam,
  onClearMyTeam
}: LeagueToolProps) {
  const [showMatchups, setShowMatchups] = useState(false);
  const [activeTeam, setActiveTeam] = useState<'myTeam' | 'opponent'>('myTeam');

  const handleSelect = (pokemon: Pokemon) => {
    if (activeTeam === 'myTeam') {
      onAddMyTeam(pokemon);
    } else {
      onAdd(pokemon);
    }
  };

  const hasBothTeams = myTeam.length > 0 && team.length > 0;

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold text-white">Ligue Pokémon</h2>
        <p className="text-sm text-slate-400">
          Constitue ton équipe et l'équipe adverse, puis calcule les matchups.
        </p>
      </div>

      <div className="flex p-1 bg-slate-800/50 rounded-xl max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => setActiveTeam('myTeam')}
          className={`
            flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all duration-200
            ${activeTeam === 'myTeam'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'}
          `}
        >
          Mon équipe
        </button>
        <button
          type="button"
          onClick={() => setActiveTeam('opponent')}
          className={`
            flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all duration-200
            ${activeTeam === 'opponent'
              ? 'bg-red-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'}
          `}
        >
          Adverses
        </button>
      </div>

      <PokemonSearch
        query={query}
        setQuery={setQuery}
        suggestions={suggestions}
        onSelect={handleSelect}
      />
      <p className="text-center text-xs text-slate-500">
        Ajoute à : <span className={activeTeam === 'myTeam' ? 'text-blue-400 font-bold' : 'text-slate-500'}>Mon équipe</span>
        {' / '}
        <span className={activeTeam === 'opponent' ? 'text-red-400 font-bold' : 'text-slate-500'}>Adverses</span>
      </p>

      <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Mon équipe</h3>
          {myTeam.length > 0 && (
            <button
              type="button"
              onClick={onClearMyTeam}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Vider
            </button>
          )}
        </div>
        {myTeam.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Aucun Pokémon dans ton équipe.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {myTeam.map((pokemon, index) => (
              <div
                key={`my-${pokemon.name}-${index}`}
                className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2"
              >
                {pokemon.sprite && (
                  <img src={pokemon.sprite} alt={pokemon.name} className="w-8 h-8 object-contain" loading="lazy" />
                )}
                <span className="text-sm font-bold text-white">{pokemon.name}</span>
                <div className="flex gap-1">
                  <TypeBadge type={pokemon.type1} size="sm" />
                  {pokemon.type2 && <TypeBadge type={pokemon.type2} size="sm" />}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveMyTeam(index)}
                  className="ml-1 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-300 flex items-center justify-center transition-colors"
                  aria-label="Retirer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowMatchups(!showMatchups)}
          disabled={!hasBothTeams}
          className={`
            py-2 px-6 rounded-xl text-sm font-bold transition-all
            ${hasBothTeams
              ? 'bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-900/30'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
          `}
        >
          {showMatchups ? 'Masquer les matchups' : 'Matchup'}
        </button>
      </div>

      <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Équipe adverse</h3>
          {team.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Vider
            </button>
          )}
        </div>

        {team.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Aucun Pokémon adverse ajouté.</p>
        ) : (
          <div className="space-y-3">
            {team.map((pokemon, index) => {
              const bestMatchup = showMatchups ? findBestMatchup(myTeam, pokemon) : null;
              return (
                <LeagueRow
                  key={`${pokemon.name}-${index}`}
                  pokemon={pokemon}
                  onRemove={() => onRemove(index)}
                  bestMatchup={bestMatchup}
                  showMatchup={showMatchups}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
