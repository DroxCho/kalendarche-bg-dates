export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-holiday-national" />
        <span className="text-muted-foreground">Национален празник</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-holiday-orthodox" />
        <span className="text-muted-foreground">Православен празник</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-holiday-nonworking" />
        <span className="text-muted-foreground">Неработен ден</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 border-primary" />
        <span className="text-muted-foreground">Днес</span>
      </div>
    </div>
  );
}
