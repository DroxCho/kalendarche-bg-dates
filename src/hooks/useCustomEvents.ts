import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'bulgarian-calendar-custom-events';

export type CustomEventColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';

export interface CustomEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  allDay: boolean;
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  color: CustomEventColor;
}

export interface CustomEventInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  color: CustomEventColor;
}

type Row = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  color: string;
};

const mapRow = (e: Row): CustomEvent => ({
  id: e.id,
  title: e.title,
  description: e.description ?? undefined,
  startDate: e.start_date,
  endDate: e.end_date,
  allDay: e.all_day,
  startTime: e.start_time ? e.start_time.slice(0, 5) : undefined,
  endTime: e.end_time ? e.end_time.slice(0, 5) : undefined,
  color: (e.color || 'blue') as CustomEventColor,
});

const toRow = (input: CustomEventInput) => ({
  title: input.title.trim(),
  description: input.description?.trim() || null,
  start_date: input.startDate,
  end_date: input.endDate,
  all_day: input.allDay,
  start_time: input.allDay ? null : input.startTime || null,
  end_time: input.allDay ? null : input.endTime || null,
  color: input.color,
});

export function useCustomEvents() {
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (user) {
        const { data, error } = await supabase
          .from('custom_events')
          .select('*')
          .order('start_date', { ascending: true });
        if (!error && data) setCustomEvents((data as Row[]).map(mapRow));
      } else {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          setCustomEvents(stored ? JSON.parse(stored) : []);
        } catch {
          setCustomEvents([]);
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const saveLocal = useCallback((events: CustomEvent[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save custom events:', e);
    }
  }, []);

  const addCustomEvent = useCallback(async (input: CustomEventInput) => {
    if (!input.title.trim()) return;
    const id = crypto.randomUUID();
    const optimistic: CustomEvent = { id, ...input, title: input.title.trim() };

    if (user) {
      const { data, error } = await supabase
        .from('custom_events')
        .insert({ id, user_id: user.id, ...toRow(input) })
        .select()
        .single();
      if (!error && data) setCustomEvents(prev => [...prev, mapRow(data as Row)]);
    } else {
      setCustomEvents(prev => {
        const next = [...prev, optimistic];
        saveLocal(next);
        return next;
      });
    }
  }, [user, saveLocal]);

  const updateCustomEvent = useCallback(async (id: string, input: CustomEventInput) => {
    if (!input.title.trim()) return;
    if (user) {
      const { error } = await supabase.from('custom_events').update(toRow(input)).eq('id', id);
      if (error) return;
    }
    setCustomEvents(prev => {
      const next = prev.map(e => (e.id === id ? { ...e, ...input, title: input.title.trim() } : e));
      if (!user) saveLocal(next);
      return next;
    });
  }, [user, saveLocal]);

  const deleteCustomEvent = useCallback(async (id: string) => {
    if (user) {
      const { error } = await supabase.from('custom_events').delete().eq('id', id);
      if (error) return;
    }
    setCustomEvents(prev => {
      const next = prev.filter(e => e.id !== id);
      if (!user) saveLocal(next);
      return next;
    });
  }, [user, saveLocal]);

  const getCustomEventsForDate = useCallback((dateString: string): CustomEvent[] => {
    return customEvents.filter(e => dateString >= e.startDate && dateString <= e.endDate);
  }, [customEvents]);

  return {
    customEvents,
    loading,
    addCustomEvent,
    updateCustomEvent,
    deleteCustomEvent,
    getCustomEventsForDate,
  };
}
