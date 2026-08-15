interface PokemonInfoButtonProps {
  onClick: () => void;
}

export function PokemonInfoButton({ onClick }: PokemonInfoButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center shadow-lg shadow-blue-900/30 transition-all hover:scale-110 active:scale-95"
      aria-label="Informations du Pokémon"
      title="Informations"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  );
}
