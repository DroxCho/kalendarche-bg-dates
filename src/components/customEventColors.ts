import { CustomEventColor } from '@/hooks/useCustomEvents';

export const CUSTOM_EVENT_COLORS: Record<CustomEventColor, { bar: string; chip: string }> = {
  blue: { bar: 'bg-blue-500', chip: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  green: { bar: 'bg-green-500', chip: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  purple: { bar: 'bg-purple-500', chip: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' },
  orange: { bar: 'bg-orange-500', chip: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
  red: { bar: 'bg-red-500', chip: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
};
