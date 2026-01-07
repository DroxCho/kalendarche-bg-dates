import { useState, useEffect, useCallback } from 'react';
import { getHolidaysForDate } from '@/data/bulgarianHolidays';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const NOTIFICATION_STORAGE_KEY = 'bulgarian-calendar-notifications-enabled';
const LAST_NOTIFICATION_KEY = 'bulgarian-calendar-last-notification';

export function useHolidayNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'pending'>('default');
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const initNotifications = async () => {
      if (isNative) {
        // Native platform - use Capacitor Push Notifications
        try {
          const permStatus = await PushNotifications.checkPermissions();
          if (permStatus.receive === 'granted') {
            setPermission('granted');
          } else if (permStatus.receive === 'denied') {
            setPermission('denied');
          } else {
            setPermission('default');
          }
        } catch (error) {
          console.error('Error checking push notification permissions:', error);
          setPermission('default');
        }
      } else {
        // Web platform - use browser notifications
        if (!('Notification' in window)) {
          return;
        }
        setPermission(Notification.permission);
      }

      // Load saved preference
      const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (saved === 'true') {
        if (isNative) {
          const permStatus = await PushNotifications.checkPermissions();
          if (permStatus.receive === 'granted') {
            setNotificationsEnabled(true);
          }
        } else if ('Notification' in window && Notification.permission === 'granted') {
          setNotificationsEnabled(true);
        }
      }
    };

    initNotifications();
  }, [isNative]);

  // Register push notification listeners for native
  useEffect(() => {
    if (!isNative || !notificationsEnabled) return;

    const registerListeners = async () => {
      // On registration success
      await PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token:', token.value);
      });

      // On registration error
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      // On push notification received
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });

      // On push notification action performed
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
      });

      // Register for push notifications
      await PushNotifications.register();
    };

    registerListeners();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [isNative, notificationsEnabled]);

  const requestPermission = useCallback(async () => {
    if (isNative) {
      try {
        const permStatus = await PushNotifications.requestPermissions();
        if (permStatus.receive === 'granted') {
          setPermission('granted');
          setNotificationsEnabled(true);
          localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
          await PushNotifications.register();
          return true;
        } else {
          setPermission('denied');
          return false;
        }
      } catch (error) {
        console.error('Error requesting push notification permissions:', error);
        return false;
      }
    } else {
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
    }
  }, [isNative]);

  const toggleNotifications = useCallback(async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'false');
    } else {
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
        if (isNative) {
          await PushNotifications.register();
        }
      } else {
        await requestPermission();
      }
    }
  }, [notificationsEnabled, permission, requestPermission, isNative]);

  const sendLocalNotification = useCallback((title: string, body: string, tag: string) => {
    if (isNative) {
      // For native, we'd typically use @capacitor/local-notifications
      // But push notifications are handled by the server
      console.log('Native notification:', { title, body, tag });
    } else {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag
      });
    }
  }, [isNative]);

  const checkAndNotify = useCallback(() => {
    if (!notificationsEnabled) return;
    if (isNative) return; // Native push notifications are handled by server

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
        sendLocalNotification(n.title, n.body, `holiday-${i}`);
      }, i * 1000);
    });

    if (notifications.length > 0) {
      localStorage.setItem(LAST_NOTIFICATION_KEY, todayStr);
    }
  }, [notificationsEnabled, isNative, sendLocalNotification]);

  // Check for holidays on mount and when enabled (web only)
  useEffect(() => {
    if (notificationsEnabled && !isNative) {
      // Check immediately
      checkAndNotify();
      
      // Check every hour
      const interval = setInterval(checkAndNotify, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [notificationsEnabled, checkAndNotify, isNative]);

  return {
    notificationsEnabled,
    permission,
    toggleNotifications,
    isSupported: isNative || 'Notification' in window,
    isNative
  };
}
