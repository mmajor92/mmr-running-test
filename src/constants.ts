import { Calendar, CheckCircle2, PlayCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TabId, ThemeColor, WorkoutCategory } from './types';

export const THEME_COLORS: readonly ThemeColor[] = [
  { hex: '#f97316', name: 'Energy Orange' },
  { hex: '#f59e0b', name: 'Solar Amber' },
  { hex: '#f43f5e', name: 'Hot Rose' },
] as const;

export const DEFAULT_THEME_HEX = THEME_COLORS[0].hex;

/** All localStorage keys live here so they can never drift apart. */
export const STORAGE_KEYS = {
  plans: 'hm_training_plans',
  activePlanId: 'hm_active_plan_id',
  themeColor: 'hm_theme_color',
  completions: 'hm_completed_workouts',
} as const;

/**
 * Typed as a full Record, so adding a new WorkoutCategory is a compile error
 * until a style is supplied. Replaces the old switch with an unreachable default.
 */
export const CATEGORY_STYLES: Record<WorkoutCategory, string> = {
  intervals: 'border-fuchsia-500/80 bg-fuchsia-950/20 text-fuchsia-400',
  progression: 'border-emerald-500/80 bg-emerald-950/20 text-emerald-400',
  shakeout: 'border-cyan-500/80 bg-cyan-950/20 text-cyan-400',
  longrun: 'border-rose-500/80 bg-rose-950/20 text-rose-400',
  raceday: 'border-amber-400 bg-amber-950/30 text-amber-300 font-bold',
};

export const FALLBACK_CATEGORY_STYLE = 'border-slate-800 bg-slate-900 text-slate-200';

export interface TabConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export const TABS: readonly TabConfig[] = [
  { id: 'upcoming', label: 'Upcoming Runs', icon: PlayCircle },
  { id: 'whole', label: 'Whole Plan', icon: Calendar },
  { id: 'previous', label: 'Previous Runs', icon: CheckCircle2 },
] as const;

/** How long the "copied" tick stays visible, in ms. */
export const COPY_FEEDBACK_MS = 2000;
