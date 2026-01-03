import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bulgarian-calendar-notes';

export interface CalendarNote {
  date: string; // YYYY-MM-DD
  note: string;
}

export function useCalendarNotes() {
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load calendar notes:', e);
    }
  }, []);

  // Save notes to localStorage whenever they change
  const saveNotes = useCallback((newNotes: Record<string, string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (e) {
      console.error('Failed to save calendar notes:', e);
    }
  }, []);

  const addNote = useCallback((date: string, note: string) => {
    const trimmedNote = note.trim();
    if (trimmedNote) {
      saveNotes({ ...notes, [date]: trimmedNote });
    } else {
      // Remove note if empty
      const { [date]: _, ...rest } = notes;
      saveNotes(rest);
    }
  }, [notes, saveNotes]);

  const removeNote = useCallback((date: string) => {
    const { [date]: _, ...rest } = notes;
    saveNotes(rest);
  }, [notes, saveNotes]);

  const getNote = useCallback((date: string): string | undefined => {
    return notes[date];
  }, [notes]);

  const hasNote = useCallback((date: string): boolean => {
    return !!notes[date];
  }, [notes]);

  return { notes, addNote, removeNote, getNote, hasNote };
}
