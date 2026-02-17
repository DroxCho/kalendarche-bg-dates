import { useTranslation } from 'react-i18next';
import { Flag, Cross, Star, Leaf, Flower2 } from 'lucide-react';

export function CalendarLegend() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm print:gap-4">
      <div className="flex items-center gap-2">
        <div className="legend-icon w-4 h-4 rounded bg-[hsl(var(--holiday-national))] print:bg-transparent flex items-center justify-center">
          <Flag className="w-2.5 h-2.5 text-white print:text-[hsl(var(--holiday-national))]" strokeWidth={2.5} />
        </div>
        <span className="text-muted-foreground print:text-black">{t('holidays.national')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="legend-icon w-4 h-4 rounded bg-[hsl(var(--holiday-orthodox))] print:bg-transparent flex items-center justify-center">
          <Cross className="w-2.5 h-2.5 text-white print:text-[hsl(var(--holiday-orthodox))]" strokeWidth={2.5} />
        </div>
        <span className="text-muted-foreground print:text-black">{t('holidays.orthodox')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="legend-icon w-4 h-4 rounded bg-[hsl(var(--holiday-nameday))] print:bg-transparent flex items-center justify-center">
          <Star className="w-2.5 h-2.5 text-white print:text-[hsl(var(--holiday-nameday))]" strokeWidth={2.5} />
        </div>
        <span className="text-muted-foreground print:text-black">{t('holidays.nameday')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="legend-icon w-4 h-4 rounded bg-[hsl(var(--holiday-folk))] print:bg-transparent flex items-center justify-center">
          <Flower2 className="w-2.5 h-2.5 text-white print:text-[hsl(var(--holiday-folk))]" strokeWidth={2.5} />
        </div>
        <span className="text-muted-foreground print:text-black">{t('holidays.folk')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="legend-icon w-4 h-4 rounded bg-[hsl(var(--holiday-fasting))] print:bg-transparent flex items-center justify-center">
          <Leaf className="w-2.5 h-2.5 text-white print:text-[hsl(var(--holiday-fasting))]" strokeWidth={2.5} />
        </div>
        <span className="text-muted-foreground print:text-black">{t('holidays.fasting')}</span>
      </div>
      <div className="flex items-center gap-2 print:hidden">
        <div className="w-4 h-4 rounded border-2 border-primary" />
        <span className="text-muted-foreground">{t('legend.today')}</span>
      </div>
    </div>
  );
}
