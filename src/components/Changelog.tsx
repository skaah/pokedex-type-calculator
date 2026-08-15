import { useState, useEffect } from 'react';
import { parseChangelog, type ChangelogVersion } from '../utils/changelog';
import changelogMd from '../../CHANGELOG.md?raw';

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function VersionCard({ version, isOpen, onToggle }: {
  version: ChangelogVersion;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-800/80">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold">
            v{version.version}
          </span>
          <span className="text-slate-400 text-xs">{formatDate(version.date)}</span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 animate-slide-up">
          {version.categories.map((category, catIndex) => (
            <div key={catIndex}>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {category.title}
              </h4>
              <ul className="space-y-1.5">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-slate-300 leading-relaxed pl-3.5 relative">
                    <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Changelog() {
  const versions = parseChangelog(changelogMd);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  if (versions.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200]">
      {menuOpen && (
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          aria-label="Fermer le journal"
        />
      )}

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-4">
        {menuOpen && (
          <div
            className="absolute bottom-full left-4 right-4 sm:left-6 sm:right-6 mb-3 max-h-[65vh] overflow-y-auto rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.7)] animate-slide-up"
          >
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                  Journal des mises à jour
                </h2>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {versions.slice(0, 4).map((version, index) => (
                  <VersionCard
                    key={version.version}
                    version={version}
                    isOpen={openIndex === index}
                    onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                  />
                ))}
              </div>

              {versions.length > 4 && (
                <p className="text-center text-xs text-slate-500">
                  {versions.length - 4} versions antérieures non affichées
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen(prev => !prev)}
          className={`
            w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-sm
            transition-all duration-200 border shadow-lg
            ${menuOpen
              ? 'bg-red-600 text-white border-red-500 shadow-red-900/30'
              : 'bg-slate-900/95 text-slate-200 border-white/10 hover:bg-slate-800 hover:border-white/20 shadow-black/40'}
          `}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Journal des mises à jour
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${!menuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
