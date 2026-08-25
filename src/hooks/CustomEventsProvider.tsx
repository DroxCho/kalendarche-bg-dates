import { ReactNode } from 'react';
import { useCustomEvents } from './useCustomEvents';
import { CustomEventsContext } from './useCustomEventsContext';

export function CustomEventsProvider({ children }: { children: ReactNode }) {
  const value = useCustomEvents();
  return <CustomEventsContext.Provider value={value}>{children}</CustomEventsContext.Provider>;
}
