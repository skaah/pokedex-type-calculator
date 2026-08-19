import { useMemo } from 'react';
import { TypeGrid } from './TypeGrid';
import { TypeBadge } from './TypeBadge';
import type { Pokemon, TypeEn } from '../types';

interface EncyclopediaProps {
  pokedex: Pokemon[];
  selectedTypes: TypeEn[];
  onToggleType: (type: TypeEn) => void;
  onClearTypes: () => void;
  onSelectPokemon: (pokemon: Pokemon) => void;
}

export function Encyclopedia({
  pokedex,
  selectedTypes,
  onToggleType,
  onClearTypes,
  onSelectPokemon
}: EncyclopediaProps) {
  const filteredPokemon = useMemo(() => {
    if (selectedTypes.length === 0) return pokedex;
    return pokedex.filter(pokemon => {
      const pokemonTypes: TypeEn[] = pokemon.type2
        ? [pokemon.type1, pokemon.type2]
        : [pokemon.type1];
      return selectedTypes.every(type => pokemonTypes.includes(type));
    });
  }, [pokedex, selectedTypes]);

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold text-white">Encyclopédie</h2>
        <p className="text-sm text-slate-400">
          Parcours tous les Pokémon et filtre par type.
        </p>
      </div>

      <TypeGrid selected={selectedTypes} onToggle={onToggleType} />

      <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            {selectedTypes.length > 0 ? 'Filtres actifs' : 'Tous les Pokémon'}
          </h3>
          {selectedTypes.length > 0 && (
            <button
              type="button"
              onClick={onClearTypes}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {selectedTypes.length > 0 ? (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {selectedTypes.map(type => (
              <TypeBadge key={type} type={type} size="md" />
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm py-2">
            Aucun filtre sélectionné
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {filteredPokemon.length} Pokémon
        </p>
      </div>

      {filteredPokemon.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {filteredPokemon.map(pokemon => (
            <button
              key={`${pokemon.name}-${pokemon.type1}-${pokemon.type2 ?? 'none'}`}
              type="button"
              onClick={() => onSelectPokemon(pokemon)}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-800/60 border border-white/10 hover:bg-slate-800/90 hover:border-white/20 hover:-translate-y-1 transition-all duration-200 text-left"
            >
              {pokemon.sprite ? (
                <img
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  className="w-20 h-20 object-contain group-hover:scale-110 transition-transform drop-shadow-lg"
                  loading="lazy"
                />
              ) : (
                <span className="w-20 h-20 flex items-center justify-center text-3xl">❓</span>
              )}
              <div className="text-center w-full">
                <h3 className="font-black text-white text-sm truncate group-hover:text-red-300 transition-colors">
                  {pokemon.name}
                </h3>
                <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
                  <TypeBadge type={pokemon.type1} size="sm" />
                  {pokemon.type2 && <TypeBadge type={pokemon.type2} size="sm" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-800/40 border border-white/5">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-400">
            Aucun Pokémon ne correspond aux filtres sélectionnés.
          </p>
        </div>
      )}
    </div>
  );
}
