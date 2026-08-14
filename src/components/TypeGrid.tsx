import typesData from '../data/types.json';
import type { TypeEn, PokemonType } from '../types';
import { TypeBadge } from './TypeBadge';

const types = typesData as PokemonType[];

interface TypeGridProps {
  selected: TypeEn[];
  onToggle: (type: TypeEn) => void;
}

export function TypeGrid({ selected, onToggle }: TypeGridProps) {
  return (
    <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4 sm:p-5">
      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {types.map(type => (
          <TypeBadge
            key={type.en}
            type={type.en}
            size="md"
            interactive
            selected={selected.includes(type.en)}
            onClick={() => onToggle(type.en)}
          />
        ))}
      </div>
      <p className="text-center text-xs text-slate-500 mt-4">
        Clique sur 1 ou 2 types pour calculer les efficacités
      </p>
    </div>
  );
}
