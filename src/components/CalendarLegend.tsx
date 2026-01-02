import { Flag, Cross, Star, Leaf } from 'lucide-react';

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[hsl(var(--holiday-national))] flex items-center justify-center">
          <Flag className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-muted-foreground">Национален</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[hsl(var(--holiday-orthodox))] flex items-center justify-center">
          <Cross className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-muted-foreground">Православен</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[hsl(var(--holiday-nameday))] flex items-center justify-center">
          <Star className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-muted-foreground">Имен ден</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[hsl(var(--holiday-folk))] flex items-center justify-center">
          <Flag className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-muted-foreground">Народен</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[hsl(var(--holiday-fasting))] flex items-center justify-center">
          <Leaf className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-muted-foreground">Постен</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 border-primary" />
        <span className="text-muted-foreground">Днес</span>
      </div>
    </div>
  );
}
