import { useState } from 'react';
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
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-800/60">
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
  const [openIndex, setOpenIndex] = useState(0);

  if (versions.length === 0) return null;

  return (
    <section className="mt-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Journal des mises à jour
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
        <p className="text-center text-xs text-slate-500 mt-3">
          {versions.length - 4} versions antérieures non affichées
        </p>
      )}
    </section>
  );
}
