import type { TypeEn } from '../types';
import { getTypeColor, getTypeFr } from '../utils/matchups';

interface TypeBadgeProps {
  type: TypeEn;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function TypeBadge({
  type,
  size = 'md',
  interactive = false,
  selected = false,
  onClick
}: TypeBadgeProps) {
  const color = getTypeColor(type);
  const name = getTypeFr(type);
  const iconSrc = `/icons/${type.toLowerCase()}.png`;

  const sizeClasses = {
    sm: 'w-[3.75rem] py-1 text-[10px] gap-0.5',
    md: 'w-[4.5rem] py-1.5 text-[11px] gap-0.5',
    lg: 'w-24 py-2.5 text-sm gap-1.5'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-9 h-9'
  };

  const textColor = getContrastColor(color);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`
        relative inline-flex flex-col items-center justify-center rounded-2xl font-black
        shadow-sm transition-all duration-200 tracking-wide
        border
        ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer hover:scale-110 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/40' : 'cursor-default'}
        ${selected ? 'border-white/80 scale-105 shadow-xl -translate-y-1' : 'border-white/10'}
      `}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${adjustBrightness(color, -30)} 100%)`,
        color: textColor,
        boxShadow: selected ? `0 0 0 3px ${color}80, 0 10px 28px ${color}50` : undefined
      }}
      title={name}
    >
      {selected && interactive && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md z-10">
          <svg className="w-3.5 h-3.5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <img
        src={iconSrc}
        alt=""
        className={`${iconSizes[size]} drop-shadow-md pointer-events-none`}
        loading="lazy"
      />
      <span>{name}</span>
    </button>
  );
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
  // Relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1e293b' : '#ffffff';
}
