import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bulgarian-calendar-notes';

export interface CalendarNote {
  id: string;
  text: string;
  createdAt: number;
}

export function useCalendarNotes() {
  const [notes, setNotes] = useState<Record<string, CalendarNote[]>>({});

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old format (string) to new format (array)
        const migrated: Record<string, CalendarNote[]> = {};
        for (const [date, value] of Object.entries(parsed)) {
          if (typeof value === 'string') {
            migrated[date] = [{
              id: crypto.randomUUID(),
              text: value,
              createdAt: Date.now()
            }];
          } else if (Array.isArray(value)) {
            migrated[date] = value as CalendarNote[];
          }
        }
        setNotes(migrated);
      }
    } catch (e) {
      console.error('Failed to load calendar notes:', e);
    }
  }, []);

  // Save notes to localStorage whenever they change
  const saveNotes = useCallback((newNotes: Record<string, CalendarNote[]>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (e) {
      console.error('Failed to save calendar notes:', e);
    }
  }, []);

  const addNote = useCallback((date: string, text: string) => {
    const trimmedText = text.trim();
    if (trimmedText) {
      const newNote: CalendarNote = {
        id: crypto.randomUUID(),
        text: trimmedText,
        createdAt: Date.now()
      };
      const dateNotes = notes[date] || [];
      saveNotes({ ...notes, [date]: [...dateNotes, newNote] });
    }
  }, [notes, saveNotes]);

  const updateNote = useCallback((date: string, noteId: string, text: string) => {
    const trimmedText = text.trim();
    const dateNotes = notes[date] || [];
    if (trimmedText) {
      const updatedNotes = dateNotes.map(n => 
        n.id === noteId ? { ...n, text: trimmedText } : n
      );
      saveNotes({ ...notes, [date]: updatedNotes });
    } else {
      // Remove note if empty
      const filteredNotes = dateNotes.filter(n => n.id !== noteId);
      if (filteredNotes.length === 0) {
        const { [date]: _, ...rest } = notes;
        saveNotes(rest);
      } else {
        saveNotes({ ...notes, [date]: filteredNotes });
      }
    }
  }, [notes, saveNotes]);

  const removeNote = useCallback((date: string, noteId: string) => {
    const dateNotes = notes[date] || [];
    const filteredNotes = dateNotes.filter(n => n.id !== noteId);
    if (filteredNotes.length === 0) {
      const { [date]: _, ...rest } = notes;
      saveNotes(rest);
    } else {
      saveNotes({ ...notes, [date]: filteredNotes });
    }
  }, [notes, saveNotes]);

  const moveNote = useCallback((fromDate: string, toDate: string, noteId: string) => {
    const fromNotes = notes[fromDate] || [];
    const noteToMove = fromNotes.find(n => n.id === noteId);
    
    if (!noteToMove || fromDate === toDate) return;
    
    const updatedFromNotes = fromNotes.filter(n => n.id !== noteId);
    const toNotes = notes[toDate] || [];
    const updatedToNotes = [...toNotes, noteToMove];
    
    const newNotes = { ...notes };
    
    if (updatedFromNotes.length === 0) {
      delete newNotes[fromDate];
    } else {
      newNotes[fromDate] = updatedFromNotes;
    }
    
    newNotes[toDate] = updatedToNotes;
    saveNotes(newNotes);
  }, [notes, saveNotes]);

  const getNotesForDate = useCallback((date: string): CalendarNote[] => {
    return notes[date] || [];
  }, [notes]);

  const hasNotes = useCallback((date: string): boolean => {
    return (notes[date]?.length || 0) > 0;
  }, [notes]);

  const getNotesCount = useCallback((date: string): number => {
    return notes[date]?.length || 0;
  }, [notes]);

  return { notes, addNote, updateNote, removeNote, moveNote, getNotesForDate, hasNotes, getNotesCount };
}
