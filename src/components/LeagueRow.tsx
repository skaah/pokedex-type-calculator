import type { Pokemon, TypeEn } from '../types';
import { TypeBadge } from './TypeBadge';
import { computeMatchups, categorizeMatchups, getTypeFr, getTypeColor } from '../utils/matchups';

interface LeagueRowProps {
  pokemon: Pokemon;
  onRemove: () => void;
  bestMatchup?: { pokemon: Pokemon; matchups: { type: TypeEn; score: number }[] } | null;
  showMatchup?: boolean;
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function getContrastColor(hex: string): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1e293b' : '#ffffff';
}

function WeaknessBadge({ type, multiplier }: { type: TypeEn; multiplier: number }) {
  const color = getTypeColor(type);
  const textColor = getContrastColor(color);
  const iconSrc = `/icons/${type.toLowerCase()}.png`;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-black border border-white/20 shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${adjustBrightness(color, -30)} 100%)`,
        color: textColor
      }}
    >
      <img src={iconSrc} alt="" className="w-3.5 h-3.5 drop-shadow-sm" loading="lazy" />
      <span>{getTypeFr(type)}</span>
      <span className="text-[10px] opacity-90 font-bold">×{multiplier}</span>
    </span>
  );
}

function BestMatchup({ matchup }: { matchup: { pokemon: Pokemon; matchups: { type: TypeEn; score: number }[] } }) {
  const effectiveMatchups = matchup.matchups.filter(m => m.score > 1).sort((a, b) => b.score - a.score);

  return (
    <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2">
      {matchup.pokemon.sprite && (
        <img
          src={matchup.pokemon.sprite}
          alt={matchup.pokemon.name}
          className="w-10 h-10 object-contain"
          loading="lazy"
        />
      )}
      <div className="min-w-0">
        <p className="font-bold text-white text-sm truncate">{matchup.pokemon.name}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          {effectiveMatchups.map((m, index) => (
            <div key={`${m.type}-${index}`} className="flex items-center gap-1">
              <TypeBadge type={m.type} size="sm" />
              <span className="text-purple-300 font-bold">×{m.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeagueRow({ pokemon, onRemove, bestMatchup, showMatchup }: LeagueRowProps) {
  const types = pokemon.type2 ? [pokemon.type1, pokemon.type2] : [pokemon.type1];
  const matchups = categorizeMatchups(computeMatchups(types));

  const weaknesses = [
    ...matchups.weakness4.map(m => ({ type: m.attacker, multiplier: 4 })),
    ...matchups.weakness2.map(m => ({ type: m.attacker, multiplier: 2 }))
  ].sort((a, b) => {
    if (b.multiplier !== a.multiplier) return b.multiplier - a.multiplier;
    return getTypeFr(a.type).localeCompare(getTypeFr(b.type));
  });

  return (
    <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl hover:bg-slate-900/60 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-shrink-0 lg:w-44">
          {pokemon.sprite ? (
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="w-12 h-12 object-contain flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <span className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0">❓</span>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm truncate">{pokemon.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <TypeBadge type={pokemon.type1} size="sm" />
              {pokemon.type2 && <TypeBadge type={pokemon.type2} size="sm" />}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 lg:hidden">Faiblesses</p>
          {weaknesses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {weaknesses.map((w, index) => (
                <WeaknessBadge key={`${w.type}-${index}`} type={w.type} multiplier={w.multiplier} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Aucune faiblesse connue.</p>
          )}
        </div>

        {showMatchup && (
          <div className="flex-shrink-0 lg:w-52">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 lg:hidden">Mon meilleur choix</p>
            {bestMatchup ? (
              <BestMatchup matchup={bestMatchup} />
            ) : (
              <p className="text-sm text-slate-500 italic">Aucun Pokémon dans ton équipe.</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onRemove}
          className="self-end lg:self-center w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-300 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Retirer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
