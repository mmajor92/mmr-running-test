import React, { useState } from 'react';
import { Archive, PlusCircle, Trash2 } from 'lucide-react';
import { ALPHA, useTheme } from '../theme/ThemeContext';
import type { TrainingPlan } from '../types';

interface PlanManagerProps {
  plans: readonly TrainingPlan[];
  activePlanId: string;
  onSelect: (planId: string) => void;
  onDelete: (planId: string) => { ok: boolean; reason?: string };
  onArchiveActive: () => void;
  onAddPlan: () => void;
  activePlanStatus: TrainingPlan['status'];
}

export function PlanManager({
  plans,
  activePlanId,
  onSelect,
  onDelete,
  onArchiveActive,
  onAddPlan,
  activePlanStatus,
}: PlanManagerProps) {
  const { color, tint } = useTheme();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Two-tap confirm instead of window.confirm, which blocks and looks broken on mobile. */
  const handleDeleteClick = (planId: string) => {
    setError(null);

    if (pendingDeleteId !== planId) {
      setPendingDeleteId(planId);
      return;
    }

    const result = onDelete(planId);
    setPendingDeleteId(null);
    if (!result.ok) setError(result.reason ?? 'That plan could not be deleted.');
  };

  return (
    <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Archive className="w-4 h-4" style={{ color }} />
          Training block manager
        </h2>
        <button
          type="button"
          onClick={onAddPlan}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-colors"
          style={{ backgroundColor: color }}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add plan</span>
        </button>
      </div>

      {error && (
        <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {plans.map((plan) => {
          const isActive = plan.id === activePlanId;
          const isPendingDelete = pendingDeleteId === plan.id;

          return (
            <li key={plan.id}>
              <div
                className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                  isActive
                    ? 'text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
                style={
                  isActive
                    ? { borderColor: tint(ALPHA.strong), backgroundColor: tint(ALPHA.soft) }
                    : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => onSelect(plan.id)}
                  className="text-left flex-1 min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
                  style={{ outlineColor: color }}
                  aria-current={isActive}
                >
                  <span className="font-bold text-sm block truncate">{plan.name}</span>
                  <span className="text-xs text-slate-500 block">
                    {plan.raceDateDisplay} • Target: {plan.targetTime}
                  </span>
                </button>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {plan.status === 'archived' ? (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold">
                      Completed
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                      Active
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteClick(plan.id)}
                    onBlur={() => isPendingDelete && setPendingDeleteId(null)}
                    className={`rounded-lg transition-colors ml-1 ${
                      isPendingDelete
                        ? 'px-2 py-1 text-[10px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/40'
                        : 'p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                    }`}
                    aria-label={
                      isPendingDelete ? `Confirm deleting ${plan.name}` : `Delete ${plan.name}`
                    }
                  >
                    {isPendingDelete ? 'Delete?' : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {activePlanStatus === 'active' && (
        <button
          type="button"
          onClick={onArchiveActive}
          className="text-xs flex items-center gap-1 pt-1 underline hover:brightness-125"
          style={{ color }}
        >
          <Archive className="w-3 h-3" /> Archive the active plan
        </button>
      )}
    </section>
  );
}
