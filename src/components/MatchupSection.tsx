import { useState } from 'react';
import type { TypeEn } from '../types';
import { TypeBadge } from './TypeBadge';

interface SectionConfig {
  key: string;
  title: string;
  multiplier: string;
  icon: string;
  gradient: string;
  borderColor: string;
  textColor: string;
}

interface MatchupData {
  strong4: TypeEn[];
  strong2: TypeEn[];
  neutral: TypeEn[];
  weak2: TypeEn[];
  weak4: TypeEn[];
  none: TypeEn[];
}

interface MatchupSectionProps {
  mode: 'defense' | 'attack';
  data: MatchupData;
}

const MODE_CONFIG = {
  defense: {
    leftTitle: 'Faiblesses',
    leftColor: 'text-rose-400',
    leftBorder: 'border-rose-500/20',
    centerTitle: 'Immunités',
    centerColor: 'text-slate-300',
    centerBorder: 'border-slate-500/20',
    rightTitle: 'Résistances',
    rightColor: 'text-blue-400',
    rightBorder: 'border-blue-500/20',
    leftSections: [
      {
        key: 'strong4',
        title: 'Très vulnérable',
        multiplier: '×4',
        icon: '⚠️',
        gradient: 'from-rose-950/80 to-red-900/50',
        borderColor: 'border-rose-500/50',
        textColor: 'text-rose-300'
      },
      {
        key: 'strong2',
        title: 'Faible',
        multiplier: '×2',
        icon: '🔻',
        gradient: 'from-amber-950/70 to-orange-900/40',
        borderColor: 'border-amber-500/50',
        textColor: 'text-amber-300'
      }
    ] as SectionConfig[],
    rightSections: [
      {
        key: 'weak4',
        title: 'Très résistant',
        multiplier: '×0.25',
        icon: '🛡️',
        gradient: 'from-green-900/70 to-emerald-800/40',
        borderColor: 'border-green-500/50',
        textColor: 'text-green-300'
      },
      {
        key: 'weak2',
        title: 'Résistant',
        multiplier: '×0.5',
        icon: '🛡️',
        gradient: 'from-blue-950/70 to-indigo-900/40',
        borderColor: 'border-blue-500/50',
        textColor: 'text-blue-300'
      }
    ] as SectionConfig[],
    noneSection: {
      key: 'none',
      title: 'Immunisé',
      multiplier: '×0',
      icon: '✨',
      gradient: 'from-slate-800/80 to-slate-700/30',
      borderColor: 'border-slate-500/30',
      textColor: 'text-slate-300'
    } as SectionConfig,
    emptyLeft: 'Aucune faiblesse',
    emptyCenter: 'Aucune immunité',
    emptyRight: 'Aucune résistance'
  },
  attack: {
    leftTitle: 'Fort contre',
    leftColor: 'text-rose-400',
    leftBorder: 'border-rose-500/20',
    centerTitle: 'Sans effet',
    centerColor: 'text-slate-300',
    centerBorder: 'border-slate-500/20',
    rightTitle: 'Peu efficace',
    rightColor: 'text-blue-400',
    rightBorder: 'border-blue-500/20',
    leftSections: [
      {
        key: 'strong4',
        title: 'Très fort contre',
        multiplier: '×4',
        icon: '🔥',
        gradient: 'from-rose-950/80 to-red-900/50',
        borderColor: 'border-rose-500/50',
        textColor: 'text-rose-300'
      },
      {
        key: 'strong2',
        title: 'Fort contre',
        multiplier: '×2',
        icon: '⚔️',
        gradient: 'from-amber-950/70 to-orange-900/40',
        borderColor: 'border-amber-500/50',
        textColor: 'text-amber-300'
      }
    ] as SectionConfig[],
    rightSections: [
      {
        key: 'weak4',
        title: 'Très peu efficace',
        multiplier: '×0.25',
        icon: '🛡️',
        gradient: 'from-green-900/70 to-emerald-800/40',
        borderColor: 'border-green-500/50',
        textColor: 'text-green-300'
      },
      {
        key: 'weak2',
        title: 'Peu efficace',
        multiplier: '×0.5',
        icon: '🔹',
        gradient: 'from-blue-950/70 to-indigo-900/40',
        borderColor: 'border-blue-500/50',
        textColor: 'text-blue-300'
      }
    ] as SectionConfig[],
    noneSection: {
      key: 'none',
      title: 'Sans effet',
      multiplier: '×0',
      icon: '✨',
      gradient: 'from-slate-800/80 to-slate-700/30',
      borderColor: 'border-slate-500/30',
      textColor: 'text-slate-300'
    } as SectionConfig,
    emptyLeft: 'Aucun type fort',
    emptyCenter: 'Aucun type sans effet',
    emptyRight: 'Aucun type peu efficace'
  }
};

export function MatchupSection({ mode, data }: MatchupSectionProps) {
  const [showNeutral, setShowNeutral] = useState(false);
  const config = MODE_CONFIG[mode];

  const hasContent =
    data.strong4.length > 0 ||
    data.strong2.length > 0 ||
    data.weak2.length > 0 ||
    data.weak4.length > 0 ||
    data.none.length > 0;

  if (!hasContent && data.neutral.length === 18) {
    return (
      <div className="text-center py-10 px-4 rounded-2xl bg-slate-800/40 border border-white/5">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-slate-400">
          Sélectionne un Pokémon ou un type pour voir les résultats.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 stagger-children">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gauche - fort */}
        <div className="space-y-3">
          <h3 className={`text-center text-xs font-black uppercase tracking-widest border-b pb-2 ${config.leftColor} ${config.leftBorder}`}>
            {config.leftTitle}
          </h3>
          {config.leftSections.map(section => (
            data[section.key as keyof MatchupData].length > 0 && (
              <ResultCard key={section.key} section={section} types={data[section.key as keyof MatchupData] as TypeEn[]} />
            )
          ))}
          {data.strong4.length === 0 && data.strong2.length === 0 && (
            <EmptyCard label={config.emptyLeft} />
          )}
        </div>

        {/* Milieu - sans effet */}
        <div className="space-y-3">
          <h3 className={`text-center text-xs font-black uppercase tracking-widest border-b pb-2 ${config.centerColor} ${config.centerBorder}`}>
            {config.centerTitle}
          </h3>
          {data.none.length > 0 ? (
            <ResultCard section={config.noneSection} types={data.none} />
          ) : (
            <EmptyCard label={config.emptyCenter} />
          )}
        </div>

        {/* Droite - faible */}
        <div className="space-y-3">
          <h3 className={`text-center text-xs font-black uppercase tracking-widest border-b pb-2 ${config.rightColor} ${config.rightBorder}`}>
            {config.rightTitle}
          </h3>
          {config.rightSections.map(section => (
            data[section.key as keyof MatchupData].length > 0 && (
              <ResultCard key={section.key} section={section} types={data[section.key as keyof MatchupData] as TypeEn[]} />
            )
          ))}
          {data.weak2.length === 0 && data.weak4.length === 0 && (
            <EmptyCard label={config.emptyRight} />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-slate-800/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowNeutral(prev => !prev)}
          className="w-full px-5 py-4 flex items-center justify-between text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span aria-hidden="true">➖</span>
            Dégâts neutres
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">{data.neutral.length}</span>
            <span className={`transform transition-transform duration-200 ${showNeutral ? 'rotate-180' : ''}`}>▼</span>
          </div>
        </button>
        {showNeutral && (
          <div className="px-5 pb-4 pt-1 animate-slide-up">
            <div className="flex flex-wrap gap-2">
              {data.neutral.map(type => (
                <TypeBadge key={type} type={type} size="sm" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ section, types }: { section: SectionConfig; types: TypeEn[] }) {
  return (
    <div
      className={`rounded-2xl p-3 border ${section.borderColor} bg-gradient-to-br ${section.gradient} shadow-lg backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true">{section.icon}</span>
          <h4 className="font-bold text-white text-sm">{section.title}</h4>
        </div>
        <span className={`text-xs font-black px-2 py-0.5 rounded bg-slate-950/40 ${section.textColor}`}>
          {section.multiplier}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {types.map(type => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>
    </div>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl p-4 border border-white/5 bg-slate-800/30 text-center">
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  );
}
