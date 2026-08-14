import React, { memo } from 'react';
import { ALPHA, useTheme } from '../theme/ThemeContext';
import { formatKm } from '../lib/workouts';

interface WeekHeadingProps {
  weekNumber: number;
  totalKm: number;
}

/** The week divider, previously duplicated three times in App.tsx. */
function WeekHeadingBase({ weekNumber, totalKm }: WeekHeadingProps) {
  const { color, tint } = useTheme();

  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-2 pt-1 px-1">
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-black uppercase tracking-wider text-slate-300 px-2.5 py-1 rounded-md border"
          style={{ backgroundColor: tint(ALPHA.tint), borderColor: tint(ALPHA.border) }}
        >
          Week {weekNumber}
        </span>
      </div>
      <div className="text-xs font-semibold text-slate-400">
        Total Volume: <strong style={{ color }}>{formatKm(totalKm)} km</strong>
      </div>
    </div>
  );
}

export const WeekHeading = memo(WeekHeadingBase);
