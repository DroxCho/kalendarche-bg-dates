import { useState, useEffect, useCallback } from 'react';
import { getHolidaysForDate, Holiday } from '@/data/bulgarianHolidays';

const NOTIFICATION_STORAGE_KEY = 'bulgarian-calendar-notifications-enabled';
const LAST_NOTIFICATION_KEY = 'bulgarian-calendar-last-notification';

export function useHolidayNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      return;
    }

    setPermission(Notification.permission);
    
    // Load saved preference
    const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (saved === 'true' && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      setNotificationsEnabled(true);
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'false');
    } else {
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
      } else {
        await requestPermission();
      }
    }
  }, [notificationsEnabled, permission, requestPermission]);

  const checkAndNotify = useCallback(() => {
    if (!notificationsEnabled) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = formatDate(today);
    const tomorrowStr = formatDate(tomorrow);

    // Check if we already notified today
    const lastNotification = localStorage.getItem(LAST_NOTIFICATION_KEY);
    if (lastNotification === todayStr) return;

    const todayHolidays = getHolidaysForDate(todayStr).filter(h => h.type !== 'fasting');
    const tomorrowHolidays = getHolidaysForDate(tomorrowStr).filter(h => h.type !== 'fasting');

    const notifications: { title: string; body: string }[] = [];

    if (todayHolidays.length > 0) {
      notifications.push({
        title: '🎉 Днес е празник!',
        body: todayHolidays.map(h => h.name).join(', ')
      });
    }

    if (tomorrowHolidays.length > 0) {
      notifications.push({
        title: '📅 Утре е празник',
        body: tomorrowHolidays.map(h => h.name).join(', ')
      });
    }

    notifications.forEach((n, i) => {
      setTimeout(() => {
        new Notification(n.title, {
          body: n.body,
          icon: '/favicon.ico',
          tag: `holiday-${i}`
        });
      }, i * 1000);
    });

    if (notifications.length > 0) {
      localStorage.setItem(LAST_NOTIFICATION_KEY, todayStr);
    }
  }, [notificationsEnabled]);

  // Check for holidays on mount and when enabled
  useEffect(() => {
    if (notificationsEnabled) {
      // Check immediately
      checkAndNotify();
      
      // Check every hour
      const interval = setInterval(checkAndNotify, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [notificationsEnabled, checkAndNotify]);

  return {
    notificationsEnabled,
    permission,
    toggleNotifications,
    isSupported: 'Notification' in window
  };
}
