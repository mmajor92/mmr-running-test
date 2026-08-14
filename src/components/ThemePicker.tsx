import { useCallback, useState } from 'react';
import { THEME_COLORS } from '../constants';
import { useDismissable } from '../hooks/useDismissable';
import { useTheme } from '../theme/ThemeContext';

export function ThemePicker() {
  const { color, setColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  const containerRef = useDismissable<HTMLDivElement>(isOpen, close);

  return (
    <div ref={containerRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-5 h-5 rounded-full border-2 border-slate-700 hover:scale-110 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 shadow-md shrink-0"
        style={{ backgroundColor: color, outlineColor: color }}
        aria-expanded={isOpen}
        aria-label="Change accent colour"
        title="Change accent colour"
      />

      {isOpen && (
        <div
          role="group"
          aria-label="Accent colours"
          className="absolute left-7 top-1/2 -translate-y-1/2 flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-full shadow-2xl z-50 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2 motion-safe:duration-150"
        >
          {THEME_COLORS.map((theme) => (
            <button
              key={theme.hex}
              type="button"
              onClick={() => {
                setColor(theme.hex);
                close();
              }}
              className={`w-5 h-5 rounded-full transition-transform hover:scale-110 shrink-0 ${
                color === theme.hex
                  ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 scale-105'
                  : ''
              }`}
              style={{ backgroundColor: theme.hex }}
              aria-pressed={color === theme.hex}
              title={theme.name}
            >
              <span className="sr-only">{theme.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
