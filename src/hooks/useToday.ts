import { useEffect, useState } from 'react';
import { toISODate } from '../lib/dates';

const REFRESH_INTERVAL_MS = 60_000;

/**
 * The current local date, kept fresh so a tab left open overnight still shows the
 * right urgency. Sleeping devices pause timers, so focus changes are checked as well.
 */
export function useToday(): string {
  const [today, setToday] = useState(() => toISODate(new Date()));

  useEffect(() => {
    const refresh = () => setToday(toISODate(new Date()));
    const timer = setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return today;
}
