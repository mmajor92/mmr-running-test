import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NewPlanModal } from './components/NewPlanModal';
import { PaceCalculator } from './components/PaceCalculator';
import { PlanHeader } from './components/PlanHeader';
import { PlanManager } from './components/PlanManager';
import { TabBar } from './components/TabBar';
import { WorkoutList } from './components/WorkoutList';
import type { ExportScope } from './components/ExportMenu';
import { useCompletions } from './hooks/useCompletions';
import { useCopyToClipboard } from './hooks/useCopyToClipboard';
import { usePlans } from './hooks/usePlans';
import { useToday } from './hooks/useToday';
import { downloadICS, generateICSContent, openGoogleCalendar } from './lib/calendar';
import { storageAvailable } from './lib/storage';
import { computePlanStats, splitByDate, workoutsInWeek } from './lib/workouts';
import { ThemeProvider } from './theme/ThemeContext';
import type { TabId, TrainingPlan, Workout } from './types';

const EMPTY_MESSAGES: Record<TabId, string> = {
  upcoming: 'Every run in this block is done. Archive the plan and set a new target.',
  whole: 'This plan has no sessions yet. Add a plan to load a template.',
  previous: 'No completed runs yet in this block. Your first session is ahead of you.',
};

function AppContent() {
  const todayStr = useToday();
  const { plans, activePlan, activePlanId, selectPlan, addPlan, archivePlan, deletePlan } =
    usePlans(todayStr);

  const [activeTab, setActiveTab] = useState<TabId>('upcoming');
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [showPlans, setShowPlans] = useState(false);
  const [showPaceCalculator, setShowPaceCalculator] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { copiedId, failedId, copy } = useCopyToClipboard();
  const { completedIds, toggleCompleted } = useCompletions();

  // Expanded cards are per-plan. Keeping one global map meant a card stayed
  // open after switching plans whenever two plans shared a workout id.
  useEffect(() => setExpandedIds(new Set()), [activePlanId]);

  const stats = useMemo(
    () => computePlanStats(activePlan, todayStr, completedIds),
    [activePlan, todayStr, completedIds],
  );

  const { upcoming, previous } = useMemo(
    () => splitByDate(activePlan.workouts, todayStr),
    [activePlan.workouts, todayStr],
  );

  const visibleWorkouts = useMemo(() => {
    if (activeTab === 'upcoming') return upcoming;
    if (activeTab === 'previous') return previous;
    return activePlan.workouts;
  }, [activeTab, upcoming, previous, activePlan.workouts]);

  const handleToggleWorkout = useCallback((workoutId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(workoutId)) next.delete(workoutId);
      else next.add(workoutId);
      return next;
    });
  }, []);

  const handleToggleCompleted = useCallback(
    (workoutId: string) => toggleCompleted(workoutId, todayStr),
    [toggleCompleted, todayStr],
  );

  const handleCopy = useCallback(
    (workoutId: string, text: string) => {
      void copy(workoutId, text);
    },
    [copy],
  );

  const handleAddToCalendar = useCallback(
    (workout: Workout) => {
      const opened = openGoogleCalendar(workout, activePlan.name);
      if (!opened) setNotice('Could not open Google Calendar. Check your popup blocker.');
    },
    [activePlan.name],
  );

  const handleExport = useCallback(
    (scope: ExportScope) => {
      const scopes: Record<ExportScope, { workouts: readonly Workout[]; suffix: string }> = {
        plan: { workouts: activePlan.workouts, suffix: 'Full_Plan' },
        week: {
          workouts: workoutsInWeek(activePlan, stats.currentWeekNumber),
          suffix: `Week_${stats.currentWeekNumber}`,
        },
        upcoming: { workouts: upcoming, suffix: 'Upcoming_Runs' },
      };

      const { workouts, suffix } = scopes[scope];
      if (workouts.length === 0) {
        setNotice('Nothing to export in that range.');
        return;
      }

      downloadICS(
        generateICSContent(workouts, `${activePlan.name} - ${suffix.replace(/_/g, ' ')}`),
        `${activePlan.name}_${suffix}`,
      );
    },
    [activePlan, stats.currentWeekNumber, upcoming],
  );

  const handleCreatePlan = useCallback(
    (plan: TrainingPlan) => {
      addPlan(plan);
      setShowNewPlanModal(false);
      setShowPlans(false);
    },
    [addPlan],
  );

  const handleArchiveActive = useCallback(
    () => archivePlan(activePlanId),
    [archivePlan, activePlanId],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <PlanHeader
          plan={activePlan}
          stats={stats}
          onExport={handleExport}
          onTogglePlans={() => setShowPlans((open) => !open)}
          onTogglePaceCalculator={() => setShowPaceCalculator((open) => !open)}
          plansOpen={showPlans}
          paceCalculatorOpen={showPaceCalculator}
        />

        {!storageAvailable && (
          <p className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            Storage is unavailable in this browser, so changes will not survive a reload. Turn off
            private browsing to keep your plans.
          </p>
        )}

        {notice && (
          <div className="flex items-start justify-between gap-3 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} className="underline shrink-0">
              Dismiss
            </button>
          </div>
        )}

        {showPlans && (
          <PlanManager
            plans={plans}
            activePlanId={activePlanId}
            activePlanStatus={activePlan.status}
            onSelect={selectPlan}
            onDelete={deletePlan}
            onArchiveActive={handleArchiveActive}
            onAddPlan={() => setShowNewPlanModal(true)}
          />
        )}

        {showNewPlanModal && (
          <NewPlanModal
            todayStr={todayStr}
            onClose={() => setShowNewPlanModal(false)}
            onCreate={handleCreatePlan}
          />
        )}

        {showPaceCalculator && <PaceCalculator />}

        <TabBar activeTab={activeTab} onChange={setActiveTab} />

        <div id={`panel-${activeTab}`} role="tabpanel">
          <WorkoutList
            workouts={visibleWorkouts}
            todayStr={todayStr}
            expandedIds={expandedIds}
            completedIds={completedIds}
            copiedId={copiedId}
            failedId={failedId}
            onToggle={handleToggleWorkout}
            onCopy={handleCopy}
            onAddToCalendar={handleAddToCalendar}
            onToggleCompleted={handleToggleCompleted}
            weekOrder={activeTab === 'previous' ? 'desc' : 'asc'}
            emptyMessage={EMPTY_MESSAGES[activeTab]}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
