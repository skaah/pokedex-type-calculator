import { useState, useMemo, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { PokemonSearch } from './components/PokemonSearch';
import { TypeGrid } from './components/TypeGrid';
import { TypeBadge } from './components/TypeBadge';
import { MatchupSection } from './components/MatchupSection';
import { EvolutionNav } from './components/EvolutionNav';
import { FloatingSprites } from './components/FloatingSprites';
import { Changelog } from './components/Changelog';
import { PokemonInfoButton } from './components/PokemonInfoButton';
import { PokemonInfoModal } from './components/PokemonInfoModal';
import { LeagueTool } from './components/LeagueTool';
import { usePokemonSearch } from './hooks/usePokemonSearch';
import { computeMatchups, categorizeMatchups, computeAttackMatchups, categorizeAttackMatchups } from './utils/matchups';
import type { TypeEn, Pokemon } from './types';

type InputMode = 'pokemon' | 'manual' | 'league';
type ResultMode = 'defense' | 'attack';

function PokeballLogo() {
  return (
    <div className="relative w-16 h-16 animate-pulse-glow rounded-full">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-red-700" />
      <div className="absolute inset-[2px] rounded-full overflow-hidden border-2 border-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-red-500 to-red-600" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-slate-100 to-slate-300" />
        <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-slate-900 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100 border-[3px] border-slate-900 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900/80" />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [inputMode, setInputMode] = useState<InputMode>('pokemon');
  const [resultMode, setResultMode] = useState<ResultMode>('defense');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<TypeEn[]>([]);
  const [infoPokemon, setInfoPokemon] = useState<Pokemon | null>(null);
  const [leagueTeam, setLeagueTeam] = useState<Pokemon[]>([]);
  const [myTeam, setMyTeam] = useState<Pokemon[]>([]);
  const mainRef = useRef<HTMLElement>(null);

  const { query, setQuery, suggestions, exactMatch, allPokemon } = usePokemonSearch();

  const effectivePokemon = useMemo(() => {
    return selectedPokemon || exactMatch;
  }, [selectedPokemon, exactMatch]);

  const currentTypes = useMemo<TypeEn[]>(() => {
    if (inputMode === 'pokemon' && effectivePokemon) {
      return effectivePokemon.type2
        ? [effectivePokemon.type1, effectivePokemon.type2]
        : [effectivePokemon.type1];
    }
    return selectedTypes;
  }, [inputMode, effectivePokemon, selectedTypes]);

  const defenseMatchups = useMemo(() => {
    if (currentTypes.length === 0) {
      return categorizeMatchups(computeMatchups([]));
    }
    return categorizeMatchups(computeMatchups(currentTypes));
  }, [currentTypes]);

  const attackMatchups = useMemo(() => {
    if (currentTypes.length === 0) {
      return categorizeAttackMatchups(computeAttackMatchups([]));
    }
    return categorizeAttackMatchups(computeAttackMatchups(currentTypes));
  }, [currentTypes]);

  const resultData = useMemo(() => {
    if (resultMode === 'defense') {
      return {
        strong4: defenseMatchups.weakness4.map(m => m.attacker),
        strong2: defenseMatchups.weakness2.map(m => m.attacker),
        neutral: defenseMatchups.neutral.map(m => m.attacker),
        weak2: defenseMatchups.resistHalf.map(m => m.attacker),
        weak4: defenseMatchups.resistQuarter.map(m => m.attacker),
        none: defenseMatchups.immune.map(m => m.attacker)
      };
    }
    return {
      strong4: attackMatchups.veryStrong.map(m => m.defender),
      strong2: attackMatchups.strong.map(m => m.defender),
      neutral: attackMatchups.neutral.map(m => m.defender),
      weak2: attackMatchups.weak.map(m => m.defender),
      weak4: attackMatchups.veryWeak.map(m => m.defender),
      none: attackMatchups.noEffect.map(m => m.defender)
    };
  }, [resultMode, defenseMatchups, attackMatchups]);

  const handleSelectPokemon = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setQuery('');
  };

  const handleToggleType = (type: TypeEn) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      if (prev.length >= 2) {
        return [prev[1], type];
      }
      return [...prev, type];
    });
  };

  const handleInputModeChange = (newMode: InputMode) => {
    setInputMode(newMode);
    setSelectedPokemon(null);
    setQuery('');
    setSelectedTypes([]);
  };

  const addLeaguePokemon = (pokemon: Pokemon) => {
    setLeagueTeam(prev => {
      if (prev.some(p => p.name === pokemon.name)) return prev;
      return [...prev, pokemon];
    });
  };

  const removeLeaguePokemon = (index: number) => {
    setLeagueTeam(prev => prev.filter((_, i) => i !== index));
  };

  const clearLeagueTeam = () => {
    setLeagueTeam([]);
  };

  const addMyTeamPokemon = (pokemon: Pokemon) => {
    setMyTeam(prev => {
      if (prev.some(p => p.name === pokemon.name)) return prev;
      return [...prev, pokemon];
    });
  };

  const removeMyTeamPokemon = (index: number) => {
    setMyTeam(prev => prev.filter((_, i) => i !== index));
  };

  const clearMyTeam = () => {
    setMyTeam([]);
  };

  return (
    <div className="relative min-h-screen py-8 px-4 sm:px-6">
      <FloatingSprites pokedex={allPokemon} mainRef={mainRef} />
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="text-center mb-8 animate-slide-up">
          <div className="flex justify-center mb-4">
            <PokeballLogo />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-lg">
            Poké-type
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            Découvre les faiblesses, résistances et immunités de tes Pokémon
          </p>
        </header>

        <main ref={mainRef} className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {/* Pokedex top bar */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-5 py-4 border-b border-white/10 rounded-t-3xl flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            </div>
            <span className="ml-auto text-xs font-bold text-red-100/80 tracking-widest uppercase">Pokédex</span>
          </div>

          {/* Input mode toggle */}
          <div className="flex p-1.5 bg-slate-950/50 border-b border-white/5">
            <button
              type="button"
              onClick={() => handleInputModeChange('pokemon')}
              className={`
                flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-300
                ${inputMode === 'pokemon'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              Recherche Pokémon
            </button>
            <button
              type="button"
              onClick={() => handleInputModeChange('manual')}
              className={`
                flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-300
                ${inputMode === 'manual'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              Sélection manuelle
            </button>
            <button
              type="button"
              onClick={() => handleInputModeChange('league')}
              className={`
                flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-300
                ${inputMode === 'league'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              Ligue Pokémon
            </button>
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {inputMode === 'league' ? (
              <LeagueTool
                team={leagueTeam}
                myTeam={myTeam}
                query={query}
                setQuery={setQuery}
                suggestions={suggestions}
                onAdd={addLeaguePokemon}
                onRemove={removeLeaguePokemon}
                onClear={clearLeagueTeam}
                onAddMyTeam={addMyTeamPokemon}
                onRemoveMyTeam={removeMyTeamPokemon}
                onClearMyTeam={clearMyTeam}
              />
            ) : inputMode === 'pokemon' ? (
              <div className="space-y-5">
                <PokemonSearch
                  query={query}
                  setQuery={setQuery}
                  suggestions={suggestions}
                  onSelect={handleSelectPokemon}
                />
                {effectivePokemon && (
                  <EvolutionNav
                    pokemon={effectivePokemon}
                    pokedex={allPokemon}
                    onSelect={handleSelectPokemon}
                  >
                    <div className="relative text-center bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-5 border-2 border-white/40 shadow-[0_0_40px_rgba(255,255,255,0.12),inset_0_0_30px_rgba(255,255,255,0.03)] animate-slide-up">
                      <div className="absolute top-3 right-3">
                        <PokemonInfoButton onClick={() => setInfoPokemon(effectivePokemon)} />
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        {effectivePokemon.sprite ? (
                          <img
                            src={effectivePokemon.sprite}
                            alt={effectivePokemon.name}
                            className="w-28 h-28 object-contain drop-shadow-lg"
                          />
                        ) : (
                          <span className="text-4xl">❓</span>
                        )}
                        <h2 className="text-2xl font-black text-white tracking-tight">{effectivePokemon.name}</h2>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                          <TypeBadge type={effectivePokemon.type1} size="lg" />
                          {effectivePokemon.type2 && (
                            <TypeBadge type={effectivePokemon.type2} size="lg" />
                          )}
                        </div>
                      </div>
                    </div>
                  </EvolutionNav>
                )}
              </div>
            ) : (
              <div className="space-y-5 animate-slide-up">
                <TypeGrid selected={selectedTypes} onToggle={handleToggleType} />

                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Types sélectionnés
                    </h3>
                    {selectedTypes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedTypes([])}
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
                      Aucun type sélectionné
                    </p>
                  )}
                </div>
              </div>
            )}

            {inputMode !== 'league' && currentTypes.length > 0 && (
              <div className="border-t border-white/10 pt-6 animate-slide-up space-y-4">
                <div className="flex p-1 bg-slate-800/50 rounded-xl max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => setResultMode('defense')}
                    className={`
                      flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all duration-200
                      ${resultMode === 'defense'
                        ? 'bg-slate-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    Défense
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultMode('attack')}
                    className={`
                      flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all duration-200
                      ${resultMode === 'attack'
                        ? 'bg-slate-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    Attaque
                  </button>
                </div>

                <MatchupSection
                  mode={resultMode}
                  data={resultData}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {infoPokemon && (
        <PokemonInfoModal
          pokemon={infoPokemon}
          onClose={() => setInfoPokemon(null)}
        />
      )}

      <Changelog />
      <Analytics />
    </div>
  );
}

export default App;
