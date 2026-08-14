import type { ReactNode } from 'react';
import type { Pokemon } from '../types';
import { TypeBadge } from './TypeBadge';
import { getEvolutionData, getPokemonByName } from '../utils/evolutions';

interface EvolutionNavProps {
  pokemon: Pokemon;
  pokedex: Pokemon[];
  onSelect: (pokemon: Pokemon) => void;
  children: ReactNode;
}

export function EvolutionNav({ pokemon, pokedex, onSelect, children }: EvolutionNavProps) {
  const data = getEvolutionData(pokemon.name);

  const previous = data.previous
    .map(name => getPokemonByName(name, pokedex))
    .filter((p): p is Pokemon => p !== undefined);

  const next = data.next
    .map(name => getPokemonByName(name, pokedex))
    .filter((p): p is Pokemon => p !== undefined);

  const variants = pokedex.filter(p => p.name === pokemon.name && p !== pokemon);

  const hasPrevious = previous.length > 0;
  const hasNext = next.length > 0;

  const gridCols =
    hasPrevious && hasNext ? 'md:grid-cols-[1fr_1.6fr_1fr]' :
    hasPrevious || hasNext ? 'md:grid-cols-[1fr_1.6fr]' :
    'md:grid-cols-1';

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-3 md:gap-4 items-start`}>
      {hasPrevious && (
        <div className="order-2 md:order-1 flex flex-col gap-3">
          <h3 className="hidden md:block text-center text-[10px] font-black uppercase tracking-widest text-slate-400 pb-1 border-b border-white/5">
            Évolution précédente
          </h3>
          {previous.map(p => (
            <EvolutionCard
              key={`prev-${p.name}-${p.type1}`}
              pokemon={p}
              direction="previous"
              onClick={() => onSelect(p)}
            />
          ))}
        </div>
      )}

      {/* Current Pokémon card + variants */}
      <div className="order-1 md:order-2 flex flex-col gap-3">
        {children}
        {variants.length > 0 && (
          <div className="flex flex-col gap-2 animate-slide-up">
            <h3 className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              Variantes
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {variants.map(v => (
                <button
                  key={`variant-${v.name}-${v.type1}`}
                  type="button"
                  onClick={() => onSelect(v)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-white/10 hover:border-red-500/40 hover:bg-slate-800 transition-all duration-200 group"
                >
                  {v.sprite ? (
                    <img src={v.sprite} alt="" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" loading="lazy" />
                  ) : (
                    <span className="w-12 h-12 flex items-center justify-center text-2xl">❓</span>
                  )}
                  <div className="flex gap-2">
                    <TypeBadge type={v.type1} size="md" />
                    {v.type2 && <TypeBadge type={v.type2} size="md" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasNext && (
        <div className="order-3 flex flex-col gap-3">
          <h3 className="hidden md:block text-center text-[10px] font-black uppercase tracking-widest text-slate-400 pb-1 border-b border-white/5">
            Évolution suivante
          </h3>
          {next.map(p => (
            <EvolutionCard
              key={`next-${p.name}-${p.type1}`}
              pokemon={p}
              direction="next"
              onClick={() => onSelect(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface EvolutionCardProps {
  pokemon: Pokemon;
  direction: 'previous' | 'next';
  onClick: () => void;
}

function EvolutionCard({ pokemon, direction, onClick }: EvolutionCardProps) {
  const arrow = direction === 'previous' ? '←' : '→';
  const label = direction === 'previous' ? 'Précédent' : 'Suivant';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/5 transition-colors duration-200 animate-slide-up text-center"
    >
      {pokemon.sprite ? (
        <img src={pokemon.sprite} alt="" className="w-20 h-20 object-contain group-hover:scale-110 transition-transform drop-shadow-lg" loading="lazy" />
      ) : (
        <span className="w-20 h-20 flex items-center justify-center text-3xl">❓</span>
      )}
      <div className="w-full">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
          {arrow} {label}
        </div>
        <h4 className="font-black text-white group-hover:text-red-300 transition-colors">
          {pokemon.name}
        </h4>
        <div className="flex flex-wrap justify-center gap-1 mt-1">
          <TypeBadge type={pokemon.type1} size="sm" />
          {pokemon.type2 && <TypeBadge type={pokemon.type2} size="sm" />}
        </div>
      </div>
    </button>
  );
}


