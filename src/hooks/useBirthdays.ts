import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load birthdays from database or localStorage
  useEffect(() => {
    const loadBirthdays = async () => {
      setLoading(true);
      
      if (user) {
        // Fetch from database
        const { data, error } = await supabase
          .from('birthdays')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (!error && data) {
          const mapped: Birthday[] = data.map(b => ({
            id: b.id,
            name: b.name,
            month: b.month,
            day: b.day,
            year: b.year ?? undefined,
            createdAt: new Date(b.created_at).getTime()
          }));
          setBirthdays(mapped);
        }
      } else {
        // Load from localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setBirthdays(JSON.parse(stored));
          }
        } catch (e) {
          console.error('Failed to load birthdays:', e);
        }
      }
      
      setLoading(false);
    };

    loadBirthdays();
  }, [user]);

  // Save to localStorage (for non-authenticated users)
  const saveToLocalStorage = useCallback((newBirthdays: Birthday[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBirthdays));
    } catch (e) {
      console.error('Failed to save birthdays:', e);
    }
  }, []);

  const addBirthday = useCallback(async (name: string, month: number, day: number, year?: number) => {
    const trimmedName = name.trim();
    if (!trimmedName || month < 1 || month > 12 || day < 1 || day > 31) return;

    const newBirthday: Birthday = {
      id: crypto.randomUUID(),
      name: trimmedName,
      month,
      day,
      year,
      createdAt: Date.now()
    };

    if (user) {
      const { data, error } = await supabase
        .from('birthdays')
        .insert({
          id: newBirthday.id,
          user_id: user.id,
          name: trimmedName,
          month,
          day,
          year: year ?? null
        })
        .select()
        .single();

      if (!error && data) {
        setBirthdays(prev => [...prev, newBirthday]);
      }
    } else {
      const newBirthdays = [...birthdays, newBirthday];
      setBirthdays(newBirthdays);
      saveToLocalStorage(newBirthdays);
    }
  }, [birthdays, user, saveToLocalStorage]);

  const updateBirthday = useCallback(async (id: string, name: string, month: number, day: number, year?: number) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (user) {
      const { error } = await supabase
        .from('birthdays')
        .update({
          name: trimmedName,
          month,
          day,
          year: year ?? null
        })
        .eq('id', id);

      if (!error) {
        setBirthdays(prev =>
          prev.map(b => b.id === id ? { ...b, name: trimmedName, month, day, year } : b)
        );
      }
    } else {
      const updated = birthdays.map(b =>
        b.id === id ? { ...b, name: trimmedName, month, day, year } : b
      );
      setBirthdays(updated);
      saveToLocalStorage(updated);
    }
  }, [birthdays, user, saveToLocalStorage]);

  const removeBirthday = useCallback(async (id: string) => {
    if (user) {
      const { error } = await supabase
        .from('birthdays')
        .delete()
        .eq('id', id);

      if (!error) {
        setBirthdays(prev => prev.filter(b => b.id !== id));
      }
    } else {
      const filtered = birthdays.filter(b => b.id !== id);
      setBirthdays(filtered);
      saveToLocalStorage(filtered);
    }
  }, [birthdays, user, saveToLocalStorage]);

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
    loading,
    addBirthday, 
    updateBirthday, 
    removeBirthday, 
    getBirthdaysForDate, 
    getBirthdaysForDateString,
    hasBirthday,
    calculateAge 
  };
}
