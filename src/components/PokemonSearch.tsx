import { useState, useRef, useEffect, useCallback } from 'react';
import type { Pokemon } from '../types';
import { TypeBadge } from './TypeBadge';

interface PokemonSearchProps {
  query: string;
  setQuery: (value: string) => void;
  suggestions: Pokemon[];
  onSelect: (pokemon: Pokemon) => void;
}

export function PokemonSearch({ query, setQuery, suggestions, onSelect }: PokemonSearchProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = suggestions[highlightedIndex];
      if (selected) {
        handleSelect(selected);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [suggestions, highlightedIndex]);

  const handleSelect = (pokemon: Pokemon) => {
    onSelect(pokemon);
    setQuery('');
    setIsOpen(false);
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
  };

  const handleFocus = () => {
    if (query.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const showSuggestions = isOpen && suggestions.length > 0;

  return (
    <div className="relative z-50 w-full max-w-md mx-auto">
      <div className="relative group">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-400 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Rechercher un Pokémon..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-800 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/30 transition-all shadow-inner"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="pokemon-suggestions"
          aria-expanded={showSuggestions}
        />
        {query.length > 0 && (
          <button
            type="button"
            onMouseDown={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 hover:text-white transition-colors flex items-center justify-center"
            aria-label="Effacer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showSuggestions && (
        <ul
          ref={listRef}
          id="pokemon-suggestions"
          className="absolute z-[100] mt-3 w-full max-h-80 overflow-y-auto rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.6)] animate-slide-up"
        >
          {suggestions.map((pokemon, index) => (
            <li
              key={`${pokemon.name}-${index}`}
              onMouseDown={() => handleSelect(pokemon)}
              className={`
                px-4 py-2.5 cursor-pointer flex items-center justify-between gap-3
                transition-colors duration-150 border-b border-white/5 last:border-0
                ${index === highlightedIndex ? 'bg-red-600/20' : 'hover:bg-white/5'}
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                  {pokemon.sprite ? (
                    <img
                      src={pokemon.sprite}
                      alt=""
                      className="w-10 h-10 object-contain flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center text-lg flex-shrink-0">❓</span>
                  )}
                <span className="font-medium text-slate-100 truncate">{pokemon.name}</span>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <TypeBadge type={pokemon.type1} size="sm" />
                {pokemon.type2 && <TypeBadge type={pokemon.type2} size="sm" />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
