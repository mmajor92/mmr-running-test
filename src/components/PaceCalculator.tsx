import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { usePaceCalculator } from '../hooks/usePaceCalculator';
import { ALPHA, useTheme } from '../theme/ThemeContext';

interface StepperProps {
  label: string;
  value: string;
  onChange: (raw: string) => void;
  onCommit: () => void;
  onStep: (delta: number) => void;
  color: string;
}

function PaceStepper({ label, value, onChange, onCommit, onStep, color }: StepperProps) {
  return (
    <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        aria-label={label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onBlur={onCommit}
        onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            onStep(1);
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            onStep(-1);
          }
        }}
        className="w-10 bg-transparent text-center font-bold py-1 text-sm focus:outline-none"
        style={{ color }}
      />
      <div className="flex flex-col border-l border-slate-700/80">
        <button
          type="button"
          onClick={() => onStep(1)}
          className="px-1 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors"
          aria-label={`Increase ${label}`}
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onStep(-1)}
          className="px-1 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors border-t border-slate-700/60"
          aria-label={`Decrease ${label}`}
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function PaceCalculator() {
  const { color, tint } = useTheme();
  const pace = usePaceCalculator();

  const splits = [
    { label: '5k', value: pace.splits.fiveK, highlight: false },
    { label: '10k', value: pace.splits.tenK, highlight: false },
    { label: '16k', value: pace.splits.sixteenK, highlight: false },
    { label: '21.1k', value: pace.splits.halfMarathon, highlight: true },
  ];

  return (
    <section className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
      <div className="border-b border-slate-800/80 pb-2">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Calculator className="w-4 h-4" style={{ color }} /> Pace calculator
        </h2>
      </div>

      <div className="flex justify-center my-1">
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <PaceStepper
            label="Pace minutes"
            value={pace.minutes}
            onChange={pace.setMinutes}
            onCommit={pace.commit}
            onStep={pace.stepMinutes}
            color={color}
          />
          <span className="text-xs text-slate-400 font-bold" aria-hidden="true">
            :
          </span>
          <PaceStepper
            label="Pace seconds"
            value={pace.seconds}
            onChange={pace.setSeconds}
            onCommit={pace.commit}
            onStep={pace.stepSeconds}
            color={color}
          />
          <span className="text-xs text-slate-400 font-medium ml-0.5">/km</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center pt-1">
        {splits.map(({ label, value, highlight }) => (
          <div
            key={label}
            className={
              highlight
                ? 'bg-slate-950/80 p-3 rounded-xl border'
                : 'bg-slate-950/80 p-3 rounded-xl border border-slate-800/80'
            }
            style={
              highlight
                ? { borderColor: tint(ALPHA.border), backgroundColor: tint(ALPHA.faint) }
                : undefined
            }
          >
            <div
              className="text-[10px] uppercase font-bold"
              style={highlight ? { color } : { color: '#64748b' }}
            >
              {label}
            </div>
            <div
              className="text-base font-black mt-0.5"
              style={highlight ? { color } : { color: '#ffffff' }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
