import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bulgarian-calendar-birthdays';

export interface Birthday {
  id: string;
  name: string;
  month: number; // 1-12
  day: number;   // 1-31
  year?: number; // Optional birth year
  createdAt: number;
}

export function useBirthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);

  // Load birthdays from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBirthdays(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load birthdays:', e);
    }
  }, []);

  // Save birthdays to localStorage whenever they change
  const saveBirthdays = useCallback((newBirthdays: Birthday[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBirthdays));
      setBirthdays(newBirthdays);
    } catch (e) {
      console.error('Failed to save birthdays:', e);
    }
  }, []);

  const addBirthday = useCallback((name: string, month: number, day: number, year?: number) => {
    const trimmedName = name.trim();
    if (trimmedName && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const newBirthday: Birthday = {
        id: crypto.randomUUID(),
        name: trimmedName,
        month,
        day,
        year,
        createdAt: Date.now()
      };
      saveBirthdays([...birthdays, newBirthday]);
    }
  }, [birthdays, saveBirthdays]);

  const updateBirthday = useCallback((id: string, name: string, month: number, day: number, year?: number) => {
    const trimmedName = name.trim();
    if (trimmedName) {
      const updated = birthdays.map(b => 
        b.id === id ? { ...b, name: trimmedName, month, day, year } : b
      );
      saveBirthdays(updated);
    }
  }, [birthdays, saveBirthdays]);

  const removeBirthday = useCallback((id: string) => {
    saveBirthdays(birthdays.filter(b => b.id !== id));
  }, [birthdays, saveBirthdays]);

  const getBirthdaysForDate = useCallback((month: number, day: number): Birthday[] => {
    return birthdays.filter(b => b.month === month && b.day === day);
  }, [birthdays]);

  const getBirthdaysForDateString = useCallback((dateString: string): Birthday[] => {
    const [, monthStr, dayStr] = dateString.split('-');
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    return getBirthdaysForDate(month, day);
  }, [getBirthdaysForDate]);

  const hasBirthday = useCallback((month: number, day: number): boolean => {
    return birthdays.some(b => b.month === month && b.day === day);
  }, [birthdays]);

  const calculateAge = useCallback((birthday: Birthday, currentYear: number): number | null => {
    if (!birthday.year) return null;
    return currentYear - birthday.year;
  }, []);

  return { 
    birthdays, 
    addBirthday, 
    updateBirthday, 
    removeBirthday, 
    getBirthdaysForDate, 
    getBirthdaysForDateString,
    hasBirthday,
    calculateAge 
  };
}
