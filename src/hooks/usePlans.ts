import { useCallback, useEffect, useMemo } from 'react';
import { STORAGE_KEYS } from '../constants';
import { INITIAL_PLAN } from '../data/defaultPlan';
import { normalizePlans } from '../lib/validation';
import { usePersistentState } from './usePersistentState';
import type { TrainingPlan } from '../types';

function revivePlans(parsed: unknown): TrainingPlan[] | null {
  const plans = normalizePlans(parsed);
  return plans.length > 0 ? plans : null;
}

function revivePlanId(parsed: unknown): string | null {
  return typeof parsed === 'string' && parsed.length > 0 ? parsed : null;
}

export interface UsePlansResult {
  plans: TrainingPlan[];
  /** Never undefined. Falls back to the first plan, then the built-in template. */
  activePlan: TrainingPlan;
  activePlanId: string;
  selectPlan: (planId: string) => void;
  addPlan: (plan: TrainingPlan) => void;
  archivePlan: (planId: string) => void;
  deletePlan: (planId: string) => { ok: boolean; reason?: string };
}

export function usePlans(todayStr: string): UsePlansResult {
  const [plans, setPlans] = usePersistentState<TrainingPlan[]>(
    STORAGE_KEYS.plans,
    revivePlans,
    () => [INITIAL_PLAN],
  );

  const [activePlanId, setActivePlanId] = usePersistentState<string>(
    STORAGE_KEYS.activePlanId,
    revivePlanId,
    () => INITIAL_PLAN.id,
  );

  /**
   * Auto-archive plans whose race date has passed.
   * The old effect always produced a new array, so it caused an extra render
   * plus a redundant localStorage write on every single mount. Returning `prev`
   * when nothing changed makes it a genuine no-op.
   */
  useEffect(() => {
    setPlans((prev) => {
      let changed = false;
      const next = prev.map((plan) => {
        if (plan.status === 'active' && plan.raceDateStr < todayStr) {
          changed = true;
          return { ...plan, status: 'archived' as const };
        }
        return plan;
      });
      return changed ? next : prev;
    });
  }, [todayStr, setPlans]);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === activePlanId) ?? plans[0] ?? INITIAL_PLAN,
    [plans, activePlanId],
  );

  const selectPlan = useCallback(
    (planId: string) => setActivePlanId(planId),
    [setActivePlanId],
  );

  const addPlan = useCallback(
    (plan: TrainingPlan) => {
      setPlans((prev) => [...prev, plan]);
      setActivePlanId(plan.id);
    },
    [setPlans, setActivePlanId],
  );

  const archivePlan = useCallback(
    (planId: string) => {
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId ? { ...plan, status: 'archived' as const } : plan,
        ),
      );
    },
    [setPlans],
  );

  const deletePlan = useCallback(
    (planId: string): { ok: boolean; reason?: string } => {
      if (plans.length <= 1) {
        return { ok: false, reason: 'Keep at least one plan. Add a new one first.' };
      }

      const remaining = plans.filter((plan) => plan.id !== planId);
      setPlans(remaining);

      if (activePlanId === planId && remaining[0]) {
        setActivePlanId(remaining[0].id);
      }
      return { ok: true };
    },
    [plans, activePlanId, setPlans, setActivePlanId],
  );

  return {
    plans,
    activePlan,
    activePlanId: activePlan.id,
    selectPlan,
    addPlan,
    archivePlan,
    deletePlan,
  };
}
