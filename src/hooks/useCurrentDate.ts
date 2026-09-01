import { useEffect, useState } from 'react';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the current day (normalized to midnight) and keeps it up to date
 * when midnight passes or the tab regains focus/visibility.
 */
export function useCurrentDate(): Date {
  const [today, setToday] = useState<Date>(startOfToday);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const check = () => {
      const next = startOfToday();
      setToday(prev => (prev.getTime() === next.getTime() ? prev : next));
      schedule();
    };

    const schedule = () => {
      clearTimeout(timer);
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      // cap at 1h so sleeping devices / drifting timers still recover
      const delay = Math.min(nextMidnight.getTime() - now.getTime() + 1000, 60 * 60 * 1000);
      timer = setTimeout(check, Math.max(delay, 1000));
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };

    schedule();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', check);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', check);
    };
  }, []);

  return today;
}
