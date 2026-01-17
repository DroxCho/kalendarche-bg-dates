import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'bulgarian-calendar-recurring-events';
const IMPORT_FLAG_KEY = 'bulgarian-calendar-recurring-events-imported';

export type EventType = 'anniversary' | 'memorial' | 'custom';
export type EventIcon = 'heart' | 'star' | 'gift' | 'calendar' | 'bell';
export type EventColor = 'purple' | 'blue' | 'green' | 'orange' | 'red';

export interface RecurringEvent {
  id: string;
  name: string;
  month: number; // 1-12
  day: number;   // 1-31
  year?: number; // Optional start year (for calculating anniversaries)
  eventType: EventType;
  icon: EventIcon;
  color: EventColor;
  createdAt: number;
}

export interface ImportResult {
  type: 'recurring_events';
  count: number;
}

export function useRecurringEvents(onImport?: (result: ImportResult) => void) {
  const [events, setEvents] = useState<RecurringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const onImportRef = useRef(onImport);
  onImportRef.current = onImport;

  // Load events from database or localStorage
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      
      if (user) {
        const { data, error } = await supabase
          .from('recurring_events')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (!error && data) {
          const mapped: RecurringEvent[] = data.map(e => ({
            id: e.id,
            name: e.name,
            month: e.month,
            day: e.day,
            year: e.year ?? undefined,
            eventType: e.event_type as EventType,
            icon: (e.icon || 'heart') as EventIcon,
            color: (e.color || 'purple') as EventColor,
            createdAt: new Date(e.created_at).getTime()
          }));
          setEvents(mapped);

          // Check if we should import localStorage data
          const importFlag = localStorage.getItem(IMPORT_FLAG_KEY);
          if (!importFlag) {
            await importLocalStorageEvents(user.id, mapped);
          }
        }
      } else {
        // Load from localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setEvents(JSON.parse(stored));
          }
        } catch (e) {
          console.error('Failed to load recurring events:', e);
        }
      }
      
      setLoading(false);
    };

    const importLocalStorageEvents = async (userId: string, existingEvents: RecurringEvent[]) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          localStorage.setItem(IMPORT_FLAG_KEY, 'true');
          return;
        }

        const localEvents: RecurringEvent[] = JSON.parse(stored);
        
        const existingKeys = new Set(
          existingEvents.map(e => `${e.name.toLowerCase()}-${e.month}-${e.day}`)
        );
        
        const eventsToImport = localEvents.filter(
          e => !existingKeys.has(`${e.name.toLowerCase()}-${e.month}-${e.day}`)
        );

        if (eventsToImport.length > 0) {
          const insertData = eventsToImport.map(e => ({
            id: crypto.randomUUID(),
            user_id: userId,
            name: e.name,
            month: e.month,
            day: e.day,
            year: e.year ?? null,
            event_type: e.eventType,
            icon: e.icon,
            color: e.color
          }));

          const { data, error } = await supabase
            .from('recurring_events')
            .insert(insertData)
            .select();

          if (!error && data) {
            const newEvents = [
              ...existingEvents,
              ...data.map(e => ({
                id: e.id,
                name: e.name,
                month: e.month,
                day: e.day,
                year: e.year ?? undefined,
                eventType: e.event_type as EventType,
                icon: (e.icon || 'heart') as EventIcon,
                color: (e.color || 'purple') as EventColor,
                createdAt: new Date(e.created_at).getTime()
              }))
            ];
            setEvents(newEvents);
            
            onImportRef.current?.({ type: 'recurring_events', count: eventsToImport.length });
          }
        }

        localStorage.setItem(IMPORT_FLAG_KEY, 'true');
      } catch (e) {
        console.error('Failed to import localStorage recurring events:', e);
      }
    };

    loadEvents();
  }, [user]);

  const saveToLocalStorage = useCallback((newEvents: RecurringEvent[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents));
    } catch (e) {
      console.error('Failed to save recurring events:', e);
    }
  }, []);

  const addEvent = useCallback(async (
    name: string, 
    month: number, 
    day: number, 
    eventType: EventType = 'anniversary',
    year?: number,
    icon: EventIcon = 'heart',
    color: EventColor = 'purple'
  ) => {
    const trimmedName = name.trim();
    if (!trimmedName || month < 1 || month > 12 || day < 1 || day > 31) return;

    const newEvent: RecurringEvent = {
      id: crypto.randomUUID(),
      name: trimmedName,
      month,
      day,
      year,
      eventType,
      icon,
      color,
      createdAt: Date.now()
    };

    if (user) {
      const { data, error } = await supabase
        .from('recurring_events')
        .insert({
          id: newEvent.id,
          user_id: user.id,
          name: trimmedName,
          month,
          day,
          year: year ?? null,
          event_type: eventType,
          icon,
          color
        })
        .select()
        .single();

      if (!error && data) {
        setEvents(prev => [...prev, newEvent]);
      }
    } else {
      setEvents(prev => {
        const newEvents = [...prev, newEvent];
        saveToLocalStorage(newEvents);
        return newEvents;
      });
    }
  }, [user, saveToLocalStorage]);

  const updateEvent = useCallback(async (
    id: string, 
    name: string, 
    month: number, 
    day: number,
    eventType: EventType,
    year?: number,
    icon?: EventIcon,
    color?: EventColor
  ) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (user) {
      const { error } = await supabase
        .from('recurring_events')
        .update({
          name: trimmedName,
          month,
          day,
          year: year ?? null,
          event_type: eventType,
          icon: icon || 'heart',
          color: color || 'purple'
        })
        .eq('id', id);

      if (!error) {
        setEvents(prev =>
          prev.map(e => e.id === id ? { 
            ...e, 
            name: trimmedName, 
            month, 
            day, 
            year, 
            eventType,
            icon: icon || e.icon,
            color: color || e.color
          } : e)
        );
      }
    } else {
      setEvents(prev => {
        const updated = prev.map(e =>
          e.id === id ? { 
            ...e, 
            name: trimmedName, 
            month, 
            day, 
            year, 
            eventType,
            icon: icon || e.icon,
            color: color || e.color
          } : e
        );
        saveToLocalStorage(updated);
        return updated;
      });
    }
  }, [user, saveToLocalStorage]);

  const removeEvent = useCallback(async (id: string) => {
    if (user) {
      const { error } = await supabase
        .from('recurring_events')
        .delete()
        .eq('id', id);

      if (!error) {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } else {
      setEvents(prev => {
        const filtered = prev.filter(e => e.id !== id);
        saveToLocalStorage(filtered);
        return filtered;
      });
    }
  }, [user, saveToLocalStorage]);

  const getEventsForDate = useCallback((month: number, day: number): RecurringEvent[] => {
    return events.filter(e => e.month === month && e.day === day);
  }, [events]);

  const hasEvent = useCallback((month: number, day: number): boolean => {
    return events.some(e => e.month === month && e.day === day);
  }, [events]);

  const calculateYears = useCallback((event: RecurringEvent, currentYear: number): number | null => {
    if (!event.year) return null;
    return currentYear - event.year;
  }, []);

  return { 
    events, 
    loading,
    addEvent, 
    updateEvent, 
    removeEvent, 
    getEventsForDate, 
    hasEvent,
    calculateYears 
  };
}
