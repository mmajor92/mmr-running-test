import React, { memo, useCallback } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { CalendarPlus, Check, CheckCircle2, ChevronDown, ChevronUp, Circle, Copy, X } from 'lucide-react';
import { CATEGORY_STYLES, FALLBACK_CATEGORY_STYLE } from '../constants';
import { ALPHA, useTheme } from '../theme/ThemeContext';
import type { Workout } from '../types';

export type CopyState = 'idle' | 'copied' | 'failed';

export interface WorkoutCardProps {
  workout: Workout;
  isToday: boolean;
  isExpanded: boolean;
  isCompleted: boolean;
  isOptional: boolean;
  /** False for runs in the future - you cannot have done tomorrow's session. */
  canComplete: boolean;
  copyState: CopyState;
  onToggle: (workoutId: string) => void;
  onCopy: (workoutId: string, text: string) => void;
  onAddToCalendar: (workout: Workout) => void;
  onToggleCompleted: (workoutId: string) => void;
}

/**
 * Memoized so typing in the pace calculator no longer re-renders all 33 cards.
 * Every prop is a primitive or a stable callback, so the comparison is cheap.
 */
function WorkoutCardBase({
  workout,
  isToday,
  isExpanded,
  isCompleted,
  isOptional,
  canComplete,
  copyState,
  onToggle,
  onCopy,
  onAddToCalendar,
  onToggleCompleted,
}: WorkoutCardProps) {
  const { color, tint } = useTheme();

  const categoryStyle = CATEGORY_STYLES[workout.category] ?? FALLBACK_CATEGORY_STYLE;

  const handleToggle = useCallback(() => onToggle(workout.id), [onToggle, workout.id]);

  const handleCopy = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onCopy(workout.id, workout.stravaTitle);
    },
    [onCopy, workout.id, workout.stravaTitle],
  );

  const handleCompleted = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onToggleCompleted(workout.id);
    },
    [onToggleCompleted, workout.id],
  );

  const handleCalendar = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onAddToCalendar(workout);
    },
    [onAddToCalendar, workout],
  );

  const ringStyle: CSSProperties | undefined = isToday
    ? ({ '--tw-ring-color': color } as CSSProperties)
    : undefined;

  const panelId = `workout-panel-${workout.id}`;

  return (
    <article
      onClick={handleToggle}
      className={`p-4 sm:p-5 rounded-2xl border-2 ${categoryStyle} transition-all cursor-pointer ${
        isToday ? 'ring-2 ring-offset-2 ring-offset-slate-950' : 'hover:brightness-110'
      }`}
      style={ringStyle}
    >
      {(isToday || isCompleted) && (
        <div className="mb-2 flex items-center gap-1.5">
          {isToday && (
            <span
              className="inline-block text-[10px] font-black uppercase text-white px-2 py-0.5 rounded-full shadow-sm"
              style={{ backgroundColor: color }}
            >
              Today
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" />
              Done
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-400 whitespace-nowrap">
            <span className="shrink-0">
              {workout.dayName}, {workout.displayDate}
            </span>
            <span className="shrink-0">•</span>
            <span className="shrink-0">Week {workout.weekNumber}</span>
            {isOptional && (
              <React.Fragment>
                <span className="shrink-0">•</span>
                <span className="shrink-0 text-slate-500 font-medium">Optional</span>
              </React.Fragment>
            )}
          </div>
          <div className="font-extrabold text-white text-base sm:text-lg mt-0.5 truncate">
            {workout.workoutType}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span
            className="font-black text-sm sm:text-base mr-1"
            style={{ color: isCompleted ? '#34d399' : color }}
          >
            {workout.totalKm}
          </span>

          {canComplete && (
          <button
            type="button"
            onClick={handleCompleted}
            className={`p-2 rounded-xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isCompleted
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            style={{ outlineColor: color }}
            aria-pressed={isCompleted}
            aria-label={
              isCompleted
                ? `Mark ${workout.workoutType} as not done`
                : `Mark ${workout.workoutType} as done`
            }
            title={isCompleted ? 'Tap to un-tick this run' : 'Tick off this run'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
          )}

          <button
            type="button"
            onClick={handleCalendar}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: color }}
            aria-label={`Add ${workout.workoutType} to Google Calendar`}
            title="Add run to Google Calendar"
          >
            <CalendarPlus className="w-4 h-4" style={{ color }} />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: tint(ALPHA.soft),
              borderColor: tint(ALPHA.border),
              color,
              outlineColor: color,
            }}
            aria-label={
              copyState === 'failed'
                ? 'Copy failed, try again'
                : `Copy Strava title for ${workout.workoutType}`
            }
            title={copyState === 'failed' ? 'Copy failed - try again' : 'Copy Strava title'}
          >
            {copyState === 'copied' && <Check className="w-4 h-4 text-emerald-400" />}
            {copyState === 'failed' && <X className="w-4 h-4 text-rose-400" />}
            {copyState === 'idle' && <Copy className="w-4 h-4" />}
          </button>

          {/* Real button, so the card is reachable and toggleable by keyboard. */}
          <button
            type="button"
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              handleToggle();
            }}
            className="text-slate-500 hover:text-slate-300 p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
            style={{ outlineColor: color }}
            aria-expanded={isExpanded}
            aria-controls={panelId}
            aria-label={isExpanded ? 'Hide coach advice' : 'Show coach advice'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs sm:text-sm text-slate-300">
        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
          Breakdown
        </span>
        {workout.breakdown}
      </div>

      {isExpanded && (
        <div
          id={panelId}
          className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150"
        >
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 space-y-2">
            {workout.advice && (
              <p className="text-xs text-slate-300 italic">
                <strong className="not-italic" style={{ color }}>
                  Coach Advice:{' '}
                </strong>
                {workout.advice}
              </p>
            )}
            {workout.nrc && (
              <div className="inline-block bg-emerald-500/10 text-emerald-400 text-[11px] px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                Suggested NRC: {workout.nrc}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export const WorkoutCard = memo(WorkoutCardBase);
