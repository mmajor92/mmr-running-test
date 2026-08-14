import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_THEME_HEX, STORAGE_KEYS, THEME_COLORS } from '../constants';
import { ALPHA, isHexColor, withAlpha } from '../lib/color';
import { usePersistentState } from '../hooks/usePersistentState';

interface ThemeContextValue {
  color: string;
  setColor: (hex: string) => void;
  /** `tint(ALPHA.border)` instead of `${themeColor}4d`. */
  tint: (alpha: number) => string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function reviveThemeColor(parsed: unknown): string | null {
  if (!isHexColor(parsed)) return null;
  const known = THEME_COLORS.some((theme) => theme.hex === parsed);
  return known ? (parsed as string) : null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [color, setColorState] = usePersistentState<string>(
    STORAGE_KEYS.themeColor,
    reviveThemeColor,
    () => DEFAULT_THEME_HEX,
  );

  const setColor = useCallback(
    (hex: string) => {
      if (THEME_COLORS.some((theme) => theme.hex === hex)) setColorState(hex);
    },
    [setColorState],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      color,
      setColor,
      tint: (alpha: number) => withAlpha(color, alpha),
    }),
    [color, setColor],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a ThemeProvider.');
  return context;
}

export { ALPHA };
