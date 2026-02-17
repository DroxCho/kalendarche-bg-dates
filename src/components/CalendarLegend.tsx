import { useTranslation } from 'react-i18next';
import { Flag, Cross, Star, Leaf, Flower2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarLegendProps {
  printMode?: boolean;
}

export function CalendarLegend({ printMode = false }: CalendarLegendProps) {
  const { t } = useTranslation();

  const iconBg = (color: string) =>
    cn(
      "legend-icon w-4 h-4 rounded flex items-center justify-center",
      printMode ? "bg-transparent" : `bg-[hsl(var(--${color}))]`,
      `print:bg-transparent`
    );

  const iconColor = (color: string) =>
    cn(
      "w-2.5 h-2.5",
      printMode ? `text-[hsl(var(--${color}))]` : "text-white",
      `print:text-[hsl(var(--${color}))]`
    );

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm print:gap-4">
      <div className="flex items-center gap-2">
        <div className={iconBg('holiday-national')}>
          <Flag className={iconColor('holiday-national')} strokeWidth={2.5} />
        </div>
        <span className={cn("text-muted-foreground", printMode && "text-black", "print:text-black")}>{t('holidays.national')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={iconBg('holiday-orthodox')}>
          <Cross className={iconColor('holiday-orthodox')} strokeWidth={2.5} />
        </div>
        <span className={cn("text-muted-foreground", printMode && "text-black", "print:text-black")}>{t('holidays.orthodox')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={iconBg('holiday-nameday')}>
          <Star className={iconColor('holiday-nameday')} strokeWidth={2.5} />
        </div>
        <span className={cn("text-muted-foreground", printMode && "text-black", "print:text-black")}>{t('holidays.nameday')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={iconBg('holiday-folk')}>
          <Flower2 className={iconColor('holiday-folk')} strokeWidth={2.5} />
        </div>
        <span className={cn("text-muted-foreground", printMode && "text-black", "print:text-black")}>{t('holidays.folk')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={iconBg('holiday-fasting')}>
          <Leaf className={iconColor('holiday-fasting')} strokeWidth={2.5} />
        </div>
        <span className={cn("text-muted-foreground", printMode && "text-black", "print:text-black")}>{t('holidays.fasting')}</span>
      </div>
      {!printMode && (
        <div className="flex items-center gap-2 print:hidden">
          <div className="w-4 h-4 rounded border-2 border-primary" />
          <span className="text-muted-foreground">{t('legend.today')}</span>
        </div>
      )}
    </div>
  );
}
