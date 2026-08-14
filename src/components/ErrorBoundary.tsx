import React from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { STORAGE_KEYS } from '../constants';
import { removeRaw } from '../lib/storage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches any render error below it.
 *
 * Without this, one thrown error blanks the entire page with no explanation -
 * which is useless on a phone, where there is no way to open a console. Error
 * boundaries have to be class components; hooks cannot do this.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Still logged for anyone who does have a console open.
    console.error('MMRunner crashed:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  /** Last resort: wipe saved plans, ticks and theme, then reload fresh. */
  handleClearData = () => {
    const confirmed = window.confirm(
      'This deletes your saved plans, ticked-off runs and colour choice from this device. Continue?',
    );
    if (!confirmed) return;

    Object.values(STORAGE_KEYS).forEach(removeRaw);
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <h1 className="text-base font-bold text-white">Something went wrong</h1>
          </div>

          <p className="text-sm text-slate-300">
            The app hit an error and stopped. Reloading fixes most problems. If it keeps happening,
            clearing your saved data usually sorts it.
          </p>

          <pre className="text-[11px] leading-relaxed text-rose-300 bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-words">
            {error.message || String(error)}
          </pre>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload the app
            </button>
            <button
              type="button"
              onClick={this.handleClearData}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear saved data
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            Copy the red text above if you want help working out what happened.
          </p>
        </div>
      </div>
    );
  }
}
