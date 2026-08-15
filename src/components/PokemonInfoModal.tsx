import { useMemo } from 'react';
import type { Pokemon, PokemonInfo } from '../types';
import { TypeBadge } from './TypeBadge';
import { getPokemonInfo, groupLocationsByMethod } from '../utils/pokemon-info';

interface PokemonInfoModalProps {
  pokemon: Pokemon;
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function EvolutionSection({ info }: { info: PokemonInfo }) {
  const { evolution } = info;

  if (!evolution.from && evolution.to.length === 0) {
    return <p className="text-sm text-slate-500 italic">Ce Pokémon n'évolue pas.</p>;
  }

  return (
    <div className="space-y-3">
      {evolution.from && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-400">Évolue de :</span>
          <span className="font-medium text-slate-200">{evolution.from}</span>
        </div>
      )}
      {evolution.to.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Évolue en :</p>
          <ul className="space-y-2">
            {evolution.to.map((step, index) => (
              <li key={index} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm bg-slate-800/50 rounded-xl px-3 py-2">
                <span className="font-bold text-white">{step.name}</span>
                {step.condition && (
                  <span className="text-slate-400 text-xs">{step.condition}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MovesSection({ info }: { info: PokemonInfo }) {
  const { moves, addedMoves } = info;

  const hasAnyMoves =
    moves.level_up.length > 0 ||
    moves.egg.length > 0 ||
    addedMoves.length > 0;

  if (!hasAnyMoves) {
    return <p className="text-sm text-slate-500 italic">Aucune capacité connue.</p>;
  }

  return (
    <div className="space-y-4">
      {addedMoves.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Attaques ajoutées (dev)</h4>
          <div className="flex flex-wrap gap-2">
            {addedMoves.map((move, index) => (
              <span key={index} className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 text-xs font-medium border border-blue-500/20">
                {move}
              </span>
            ))}
          </div>
        </div>
      )}

      {moves.level_up.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Capacités par niveau</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {moves.level_up.map((move, index) => (
              <li key={index} className="flex items-center justify-between text-sm bg-slate-800/40 rounded-lg px-3 py-1.5">
                <span className="text-slate-200">{move.name}</span>
                <span className="text-xs text-slate-500">N. {move.level}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function HeldItemsSection({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500 italic">Aucun objet tenu en sauvage.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={index} className="px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-200 text-xs font-medium border border-yellow-500/20">
          {item}
        </span>
      ))}
    </div>
  );
}

function LocationsSection({ info }: { info: PokemonInfo }) {
  const grouped = useMemo(() => groupLocationsByMethod(info.locations), [info.locations]);
  const methods = Object.keys(grouped);

  if (methods.length === 0) {
    return <p className="text-sm text-slate-500 italic">Localisation inconnue.</p>;
  }

  return (
    <div className="space-y-4">
      {methods.map(method => (
        <div key={method}>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{method}</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {grouped[method].map((loc, index) => (
              <li key={index} className="text-sm bg-slate-800/40 rounded-lg px-3 py-1.5">
                <span className="text-slate-200">{loc.zone}</span>
                {loc.note && <span className="text-xs text-slate-500 block">{loc.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function PokemonInfoModal({ pokemon, onClose }: PokemonInfoModalProps) {
  const info = getPokemonInfo(pokemon.name);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Fermer"
      />

      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.7)] animate-slide-up">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {pokemon.sprite && (
              <img src={pokemon.sprite} alt={pokemon.name} className="w-12 h-12 object-contain" />
            )}
            <div>
              <h2 className="text-xl font-black text-white">{pokemon.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <TypeBadge type={pokemon.type1} size="sm" />
                {pokemon.type2 && <TypeBadge type={pokemon.type2} size="sm" />}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!info ? (
            <p className="text-center text-slate-400 py-8">Aucune information disponible pour ce Pokémon.</p>
          ) : (
            <>
              <Section title="Évolution">
                <EvolutionSection info={info} />
              </Section>

              <Section title="Capacités">
                <MovesSection info={info} />
              </Section>

              <Section title="Objets tenus (sauvages)">
                <HeldItemsSection items={info.heldItems} />
              </Section>

              <Section title="Localisation">
                <LocationsSection info={info} />
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
