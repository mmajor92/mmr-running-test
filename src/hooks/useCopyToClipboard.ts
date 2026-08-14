import { useCallback, useEffect, useRef, useState } from 'react';
import { COPY_FEEDBACK_MS } from '../constants';

type CopyStatus = 'idle' | 'copied' | 'failed';

export interface UseCopyResult {
  copiedId: string | null;
  failedId: string | null;
  copy: (id: string, text: string) => Promise<void>;
}

/**
 * Copy-to-clipboard with the three things the original was missing:
 *  - awaits the promise, so a rejection no longer shows a false success tick
 *  - falls back to execCommand when navigator.clipboard is unavailable
 *    (it is undefined on http origins, which includes most LAN testing)
 *  - clears its timer on unmount, and resets it on rapid repeat clicks
 */
export function useCopyToClipboard(): UseCopyResult {
  const [state, setState] = useState<{ id: string | null; status: CopyStatus }>({
    id: null,
    status: 'idle',
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = useCallback(async (id: string, text: string) => {
    let ok = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        ok = legacyCopy(text);
      }
    } catch {
      ok = legacyCopy(text);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    setState({ id, status: ok ? 'copied' : 'failed' });
    timerRef.current = setTimeout(
      () => setState({ id: null, status: 'idle' }),
      COPY_FEEDBACK_MS,
    );
  }, []);

  return {
    copiedId: state.status === 'copied' ? state.id : null,
    failedId: state.status === 'failed' ? state.id : null,
    copy,
  };
}

function legacyCopy(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}
