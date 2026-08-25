import { createContext, useContext } from 'react';
import { useCustomEvents } from './useCustomEvents';

export type CustomEventsContextValue = ReturnType<typeof useCustomEvents>;

export const CustomEventsContext = createContext<CustomEventsContextValue | null>(null);

/** Returns null when no provider is mounted (e.g. print-only trees). */
export function useCustomEventsContext(): CustomEventsContextValue | null {
  return useContext(CustomEventsContext);
}
