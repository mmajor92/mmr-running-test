import { useCallback, useState } from 'react';
import { BarChart3, Calendar, ChevronDown, Download, PlayCircle } from 'lucide-react';
import { useDismissable } from '../hooks/useDismissable';
import { useTheme } from '../theme/ThemeContext';

export type ExportScope = 'plan' | 'week' | 'upcoming';

interface ExportMenuProps {
  onExport: (scope: ExportScope) => void;
  currentWeekNumber: number;
}

export function ExportMenu({ onExport, currentWeekNumber }: ExportMenuProps) {
  const { color } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  const containerRef = useDismissable<HTMLDivElement>(isOpen, close);

  const handleSelect = (scope: ExportScope) => {
    onExport(scope);
    close();
  };

  const items: ReadonlyArray<{ scope: ExportScope; label: string; Icon: typeof Calendar }> = [
    { scope: 'plan', label: 'Whole plan', Icon: Calendar },
    { scope: 'week', label: `Week ${currentWeekNumber}`, Icon: BarChart3 },
    { scope: 'upcoming', label: 'Upcoming runs', Icon: PlayCircle },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full justify-center inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: color }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Download className="w-3 h-3 shrink-0" style={{ color }} />
        <span className="whitespace-nowrap">Export cal</span>
        <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50"
        >
          {items.map(({ scope, label, Icon }) => (
            <button
              key={scope}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(scope)}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>{label}</span>
              <Icon className="w-3.5 h-3.5 shrink-0 ml-1" style={{ color }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
