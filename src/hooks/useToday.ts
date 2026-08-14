import { useEffect, useState } from 'react';
import { todayISO } from '../lib/date';

/**
 * Today's date as YYYY-MM-DD, refreshed when the day rolls over.
 *
 * The old `todayStr` was a `useMemo` with an empty dependency list, so a phone
 * left open overnight kept showing yesterday's "Today" badge and yesterday's
 * upcoming/previous split until a manual reload.
 */
export function useToday(): string {
  const [today, setToday] = useState(todayISO);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextCheck = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 5, 0); // Five seconds past, to avoid edge rounding.
      timeoutId = setTimeout(() => {
        setToday(todayISO());
        scheduleNextCheck();
      }, midnight.getTime() - now.getTime());
    };

    // A backgrounded tab suspends timers, so re-check when it becomes visible.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') setToday(todayISO());
    };

    scheduleNextCheck();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return today;
}
