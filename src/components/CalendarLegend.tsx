import { Flag, Cross, Star, Leaf } from 'lucide-react';

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm print:gap-4">
      <div className="flex items-center gap-2">
        <div className="legend-icon w-4 h-4 rounded bg-[hsl(var(--holiday-national))] flex items-center justify-center">
          <Flag className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-muted-foreground print:text-black">Национален</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="legend-icon w-4 h-4 rounded bg-[hsl(var(--holiday-orthodox))] flex items-center justify-center">
          <Cross className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-muted-foreground print:text-black">Православен</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="legend-icon w-4 h-4 rounded bg-[hsl(var(--holiday-nameday))] flex items-center justify-center">
          <Star className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-muted-foreground print:text-black">Имен ден</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="legend-icon w-4 h-4 rounded bg-[hsl(var(--holiday-folk))] flex items-center justify-center">
          <Flag className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-muted-foreground print:text-black">Народен</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="legend-icon w-4 h-4 rounded bg-[hsl(var(--holiday-fasting))] flex items-center justify-center">
          <Leaf className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-muted-foreground print:text-black">Постен</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 border-primary print:border-black" />
        <span className="text-muted-foreground print:text-black">Днес</span>
      </div>
    </div>
  );
}
