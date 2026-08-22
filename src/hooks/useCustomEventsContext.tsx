import { createContext, useContext, ReactNode } from 'react';
import { useCustomEvents } from './useCustomEvents';

type CustomEventsContextValue = ReturnType<typeof useCustomEvents>;

const CustomEventsContext = createContext<CustomEventsContextValue | null>(null);

export function CustomEventsProvider({ children }: { children: ReactNode }) {
  const value = useCustomEvents();
  return <CustomEventsContext.Provider value={value}>{children}</CustomEventsContext.Provider>;
}

/** Returns null when no provider is mounted (e.g. print-only trees). */
export function useCustomEventsContext(): CustomEventsContextValue | null {
  return useContext(CustomEventsContext);
}
