export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[hsl(var(--holiday-national))]" />
        <span className="text-muted-foreground">Национален</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[hsl(var(--holiday-orthodox))]" />
        <span className="text-muted-foreground">Православен</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[hsl(var(--holiday-nameday))]" />
        <span className="text-muted-foreground">Имен ден</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[hsl(var(--holiday-folk))]" />
        <span className="text-muted-foreground">Народен</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[hsl(var(--holiday-fasting))]" />
        <span className="text-muted-foreground">Постен</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 border-primary" />
        <span className="text-muted-foreground">Днес</span>
      </div>
    </div>
  );
}
