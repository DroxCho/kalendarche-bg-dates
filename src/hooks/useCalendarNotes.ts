import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'bulgarian-calendar-notes';
const IMPORT_FLAG_KEY = 'bulgarian-calendar-notes-imported';

export interface CalendarNote {
  id: string;
  text: string;
  createdAt: number;
}

export interface ImportResult {
  type: 'notes';
  count: number;
}

export function useCalendarNotes(onImport?: (result: ImportResult) => void) {
  const [notes, setNotes] = useState<Record<string, CalendarNote[]>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const onImportRef = useRef(onImport);
  onImportRef.current = onImport;

  // Load notes from database or localStorage
  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);
      
      if (user) {
        // Fetch from database
        const { data, error } = await supabase
          .from('calendar_notes')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (!error && data) {
          const grouped: Record<string, CalendarNote[]> = {};
          data.forEach(note => {
            if (!grouped[note.date]) {
              grouped[note.date] = [];
            }
            grouped[note.date].push({
              id: note.id,
              text: note.text,
              createdAt: new Date(note.created_at).getTime()
            });
          });
          setNotes(grouped);

          // Check if we should import localStorage data
          const importFlag = localStorage.getItem(IMPORT_FLAG_KEY);
          if (!importFlag) {
            await importLocalStorageNotes(user.id, grouped);
          }
        }
      } else {
        // Load from localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
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
      }
      
      setLoading(false);
    };

    const importLocalStorageNotes = async (userId: string, existingNotes: Record<string, CalendarNote[]>) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          localStorage.setItem(IMPORT_FLAG_KEY, 'true');
          return;
        }

        const parsed = JSON.parse(stored);
        const localNotes: Record<string, CalendarNote[]> = {};
        
        for (const [date, value] of Object.entries(parsed)) {
          if (typeof value === 'string') {
            localNotes[date] = [{
              id: crypto.randomUUID(),
              text: value,
              createdAt: Date.now()
            }];
          } else if (Array.isArray(value)) {
            localNotes[date] = value as CalendarNote[];
          }
        }

        // Find notes that don't exist in the database
        const notesToImport: { date: string; note: CalendarNote }[] = [];
        
        for (const [date, dateNotes] of Object.entries(localNotes)) {
          const existingDateNotes = existingNotes[date] || [];
          const existingTexts = new Set(existingDateNotes.map(n => n.text));
          
          for (const note of dateNotes) {
            if (!existingTexts.has(note.text)) {
              notesToImport.push({ date, note });
            }
          }
        }

        if (notesToImport.length > 0) {
          const insertData = notesToImport.map(({ date, note }) => ({
            id: crypto.randomUUID(),
            user_id: userId,
            date,
            text: note.text
          }));

          const { data, error } = await supabase
            .from('calendar_notes')
            .insert(insertData)
            .select();

          if (!error && data) {
            // Update local state with imported notes
            const newNotes = { ...existingNotes };
            data.forEach(note => {
              if (!newNotes[note.date]) {
                newNotes[note.date] = [];
              }
              newNotes[note.date].push({
                id: note.id,
                text: note.text,
                createdAt: new Date(note.created_at).getTime()
              });
            });
            setNotes(newNotes);
            
            onImportRef.current?.({ type: 'notes', count: notesToImport.length });
          }
        }

        localStorage.setItem(IMPORT_FLAG_KEY, 'true');
      } catch (e) {
        console.error('Failed to import localStorage notes:', e);
      }
    };

    loadNotes();
  }, [user]);

  // Save to localStorage (for non-authenticated users)
  const saveToLocalStorage = useCallback((newNotes: Record<string, CalendarNote[]>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    } catch (e) {
      console.error('Failed to save calendar notes:', e);
    }
  }, []);

  const addNote = useCallback(async (date: string, text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const newNote: CalendarNote = {
      id: crypto.randomUUID(),
      text: trimmedText,
      createdAt: Date.now()
    };

    if (user) {
      const { data, error } = await supabase
        .from('calendar_notes')
        .insert({
          id: newNote.id,
          user_id: user.id,
          date,
          text: trimmedText
        })
        .select()
        .single();

      if (!error && data) {
        setNotes(prev => {
          const dateNotes = prev[date] || [];
          return { ...prev, [date]: [...dateNotes, newNote] };
        });
      }
    } else {
      setNotes(prev => {
        const dateNotes = prev[date] || [];
        const newNotes = { ...prev, [date]: [...dateNotes, newNote] };
        saveToLocalStorage(newNotes);
        return newNotes;
      });
    }
  }, [user, saveToLocalStorage]);

  const removeNote = useCallback(async (date: string, noteId: string) => {
    if (user) {
      const { error } = await supabase
        .from('calendar_notes')
        .delete()
        .eq('id', noteId);

      if (!error) {
        setNotes(prev => {
          const dateNotes = prev[date] || [];
          const filteredNotes = dateNotes.filter(n => n.id !== noteId);
          if (filteredNotes.length === 0) {
            const { [date]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [date]: filteredNotes };
        });
      }
    } else {
      setNotes(prev => {
        const dateNotes = prev[date] || [];
        const filteredNotes = dateNotes.filter(n => n.id !== noteId);
        let newNotes: Record<string, CalendarNote[]>;
        if (filteredNotes.length === 0) {
          const { [date]: _, ...rest } = prev;
          newNotes = rest;
        } else {
          newNotes = { ...prev, [date]: filteredNotes };
        }
        saveToLocalStorage(newNotes);
        return newNotes;
      });
    }
  }, [user, saveToLocalStorage]);

  const updateNote = useCallback(async (date: string, noteId: string, text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      // Remove note if empty
      await removeNote(date, noteId);
      return;
    }

    if (user) {
      const { error } = await supabase
        .from('calendar_notes')
        .update({ text: trimmedText })
        .eq('id', noteId);

      if (!error) {
        setNotes(prev => {
          const dateNotes = prev[date] || [];
          const updatedNotes = dateNotes.map(n =>
            n.id === noteId ? { ...n, text: trimmedText } : n
          );
          return { ...prev, [date]: updatedNotes };
        });
      }
    } else {
      setNotes(prev => {
        const dateNotes = prev[date] || [];
        const updatedNotes = dateNotes.map(n =>
          n.id === noteId ? { ...n, text: trimmedText } : n
        );
        const newNotes = { ...prev, [date]: updatedNotes };
        saveToLocalStorage(newNotes);
        return newNotes;
      });
    }
  }, [user, saveToLocalStorage, removeNote]);

  const moveNote = useCallback(async (fromDate: string, toDate: string, noteId: string) => {
    if (fromDate === toDate) return;

    const fromNotes = notes[fromDate] || [];
    const noteToMove = fromNotes.find(n => n.id === noteId);
    if (!noteToMove) return;

    if (user) {
      const { error } = await supabase
        .from('calendar_notes')
        .update({ date: toDate })
        .eq('id', noteId);

      if (!error) {
        setNotes(prev => {
          const updatedFromNotes = (prev[fromDate] || []).filter(n => n.id !== noteId);
          const toNotes = prev[toDate] || [];
          const updatedToNotes = [...toNotes, noteToMove];

          const newNotes = { ...prev };
          if (updatedFromNotes.length === 0) {
            delete newNotes[fromDate];
          } else {
            newNotes[fromDate] = updatedFromNotes;
          }
          newNotes[toDate] = updatedToNotes;
          return newNotes;
        });
      }
    } else {
      setNotes(prev => {
        const updatedFromNotes = (prev[fromDate] || []).filter(n => n.id !== noteId);
        const toNotes = prev[toDate] || [];
        const updatedToNotes = [...toNotes, noteToMove];

        const newNotes = { ...prev };
        if (updatedFromNotes.length === 0) {
          delete newNotes[fromDate];
        } else {
          newNotes[fromDate] = updatedFromNotes;
        }
        newNotes[toDate] = updatedToNotes;
        saveToLocalStorage(newNotes);
        return newNotes;
      });
    }
  }, [notes, user, saveToLocalStorage]);

  const getNotesForDate = useCallback((date: string): CalendarNote[] => {
    return notes[date] || [];
  }, [notes]);

  const hasNotes = useCallback((date: string): boolean => {
    return (notes[date]?.length || 0) > 0;
  }, [notes]);

  const getNotesCount = useCallback((date: string): number => {
    return notes[date]?.length || 0;
  }, [notes]);

  return { 
    notes, 
    loading,
    addNote, 
    updateNote, 
    removeNote, 
    moveNote, 
    getNotesForDate, 
    hasNotes, 
    getNotesCount 
  };
}
