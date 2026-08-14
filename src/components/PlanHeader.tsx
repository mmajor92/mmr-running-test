import React from 'react';
import { BarChart3, Calculator, Clock, Flame, FolderArchive, Trophy } from 'lucide-react';
import { ALPHA, useTheme } from '../theme/ThemeContext';
import { formatKm } from '../lib/workouts';
import { ExportMenu } from './ExportMenu';
import type { ExportScope } from './ExportMenu';
import { ThemePicker } from './ThemePicker';
import type { PlanStats, TrainingPlan } from '../types';

interface PlanHeaderProps {
  plan: TrainingPlan;
  stats: PlanStats;
  onExport: (scope: ExportScope) => void;
  onTogglePlans: () => void;
  onTogglePaceCalculator: () => void;
  plansOpen: boolean;
  paceCalculatorOpen: boolean;
}

export function PlanHeader({
  plan,
  stats,
  onExport,
  onTogglePlans,
  onTogglePaceCalculator,
  plansOpen,
  paceCalculatorOpen,
}: PlanHeaderProps) {
  const { color, tint } = useTheme();

  const pillClass =
    'w-full justify-center inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-6 shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none" aria-hidden="true">
        <Trophy className="w-48 h-48" style={{ color }} />
      </div>

      <div className="relative z-10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border text-slate-300"
              style={{ backgroundColor: tint(ALPHA.tint), borderColor: tint(ALPHA.border) }}
            >
              <Flame className="w-3.5 h-3.5" style={{ color }} />
              <span>MMR Running Hub</span>
            </div>

            <ThemePicker />

            {plan.status === 'archived' && (
              <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                Archived block
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
            <ExportMenu onExport={onExport} currentWeekNumber={stats.currentWeekNumber} />

            <button
              type="button"
              onClick={onTogglePlans}
              className={pillClass}
              style={{ outlineColor: color }}
              aria-expanded={plansOpen}
            >
              <FolderArchive className="w-3 h-3 shrink-0" style={{ color }} />
              <span className="whitespace-nowrap">Plans</span>
            </button>

            <button
              type="button"
              onClick={onTogglePaceCalculator}
              className={pillClass}
              style={{ outlineColor: color }}
              aria-expanded={paceCalculatorOpen}
            >
              <Calculator className="w-3 h-3 shrink-0" style={{ color }} />
              <span className="whitespace-nowrap">Pace</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl
