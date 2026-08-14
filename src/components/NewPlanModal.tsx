import React, { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';
import { createTemplateWorkouts, templateRaceDateFor } from '../data/defaultPlan';
import { addDaysISO, formatLongDateISO, isValidISODate, todayISO } from '../lib/date';
import { parsePastedPlan } from '../lib/parsePlan';
import { useTheme } from '../theme/ThemeContext';
import { Modal } from './Modal';
import type { PlanDraft, TrainingPlan } from '../types';

interface NewPlanModalProps {
  onClose: () => void;
  onCreate: (plan: TrainingPlan) => void;
  todayStr: string;
}

const EIGHT_WEEKS = 56;

function createEmptyDraft(): PlanDraft {
  const start = todayISO();
  return {
    name: '',
    startDateStr: start,
    raceDateStr: addDaysISO(start, EIGHT_WEEKS) ?? start,
    targetPace: '5:40 /km',
    targetTime: '< 2:00:00',
    pastedText: '',
  };
}

const inputClass =
  'w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-slate-600';
const labelClass = 'text-xs font-semibold text-slate-300 block mb-1';

export function NewPlanModal({ onClose, onCreate, todayStr }: NewPlanModalProps) {
  const { color } = useTheme();
  const [draft, setDraft] = useState<PlanDraft>(createEmptyDraft);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const update = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
    setWarnings([]);
  };

  /** Dates are validated here rather than trusted from the input element. */
  const validationErrors = useMemo(() => {
    const found: string[] = [];
    if (!draft.name.trim()) found.push('Give the plan a name.');
    if (!isValidISODate(draft.startDateStr)) found.push('Enter a valid start date.');
    if (!isValidISODate(draft.raceDateStr)) found.push('Enter a valid race date.');
    if (
      isValidISODate(draft.startDateStr) &&
      isValidISODate(draft.raceDateStr) &&
      draft.raceDateStr < draft.startDateStr
    ) {
      found.push('Race day cannot fall before the start date.');
    }
    return found;
  }, [draft.name, draft.startDateStr, draft.raceDateStr]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const planId = `plan-${Date.now()}`;
    const name = draft.name.trim();
    let raceDateStr = draft.raceDateStr;
    let workouts;

    if (draft.pastedText.trim()) {
      const result = parsePastedPlan(draft.pastedText, draft.startDateStr, name);

      if (result.workouts.length === 0) {
        setErrors(
          result.warnings.length > 0
            ? result.warnings
            : ['No sessions were recognised. Clear the box to use the built-in template.'],
        );
        return;
      }

      // Show what was inferred once, and let a second press confirm.
      if (result.warnings.length > 0 && warnings.length === 0) {
        setWarnings([
          ...result.warnings,
          `${result.workouts.length} sessions ready. Press save again to continue.`,
        ]);
        return;
      }

      workouts = result.workouts;
    } else {
      workouts = createTemplateWorkouts(draft.startDateStr, planId);
      raceDateStr = templateRaceDateFor(draft.startDateStr);
    }

    onCreate({
      id: planId,
      name,
      targetPace: draft.targetPace.trim() || '-',
      startDateStr: draft.startDateStr,
      raceDateStr,
      raceDateDisplay: formatLongDateISO(raceDateStr),
      targetTime: draft.targetTime.trim() || '-',
      status: raceDateStr < todayStr ? 'archived' : 'active',
      workouts,
    });
  };

  return (
    <Modal
      onClose={onClose}
      title={
        <React.Fragment>
          <PlusCircle className="w-4 h-4" style={{ color }} />
          Add training plan
        </React.Fragment>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label className={labelClass} htmlFor="plan-name">
            Plan name
          </label>
          <input
            id="plan-name"
            type="text"
            placeholder="e.g. Spring 10k prep, London HM 2027"
            value={draft.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => update('name', event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="plan-start">
              Start date
            </label>
            <input
              id="plan-start"
              type="date"
              value={draft.startDateStr}
              onChange={(event: ChangeEvent<HTMLInputElement>) => update('startDateStr', event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="plan-race">
              Race date
            </label>
            <input
              id="plan-race"
              type="date"
              value={draft.raceDateStr}
              min={draft.startDateStr}
              onChange={(event: ChangeEvent<HTMLInputElement>) => update('raceDateStr', event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="plan-pace">
              Target pace
            </label>
            <input
              id="plan-pace"
              type="text"
              placeholder="e.g. 5:30 /km"
              value={draft.targetPace}
              onChange={(event: ChangeEvent<HTMLInputElement>) => update('targetPace', event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="plan-time">
              Target time
            </label>
            <input
              id="plan-time"
              type="text"
              placeholder="e.g. Sub-2:00"
              value={draft.targetTime}
              onChange={(event: ChangeEvent<HTMLInputElement>) => update('targetTime', event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className={`${labelClass} flex items-center gap-1 mb-0`} htmlFor="plan-paste">
              <Sparkles className="w-3.5 h-3.5" style={{ color }} />
              Paste an AI-generated plan
            </label>
            <span className="text-[10px] text-slate-500">Optional</span>
          </div>
          <textarea
            id="plan-paste"
            rows={4}
            placeholder="Paste raw workout output here - bullet points, markdown tables, or plain lines. Include 'Week 1', 'Week 2' headings and a weekday per session for the most accurate dates."
            value={draft.pastedText}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => update('pastedText', event.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600 font-mono"
          />
          <p className="text-[10px] text-slate-500 mt-0.5">
            Leave blank to load the 8-week half-marathon template, dated from your start date.
          </p>
        </div>

        {errors.length > 0 && (
          <ul className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 space-y-1">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        {warnings.length > 0 && (
          <ul className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 space-y-1">
            {warnings.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-bold hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition hover:brightness-110"
            style={{ backgroundColor: color }}
          >
            Save and activate
          </button>
        </div>
      </form>
    </Modal>
  );
}
