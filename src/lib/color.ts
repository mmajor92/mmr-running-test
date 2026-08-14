/**
 * Colour helpers.
 * Replaces the scattered magic suffixes (`${themeColor}26`, `4d`, `1a`, `cc`)
 * with a named function, so opacity is readable and typo-proof.
 */

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_RE.test(value.trim());
}

/** Returns `#rrggbbaa`. Falls back to the base colour if it is not valid hex. */
export function withAlpha(hex: string, alpha: number): string {
  if (!isHexColor(hex)) return hex;

  let base = hex.trim().slice(1);
  if (base.length === 3) {
    base = base
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const clamped = Math.min(1, Math.max(0, alpha));
  const suffix = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${base}${suffix}`;
}

/** Named opacity steps, matching the original design exactly. */
export const ALPHA = {
  faint: 0.05, // was 0d
  soft: 0.1, // was 1a
  tint: 0.15, // was 26
  border: 0.3, // was 4d
  strong: 0.8, // was cc
} as const;
