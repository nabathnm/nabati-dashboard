interface ScheduleRowProps {
  dayLabels: string[];
}

export default function CalendarRow({ dayLabels }: ScheduleRowProps) {
  return (
    <div className="flex border-b border-border/60 bg-muted/40">
      <div className="w-16 shrink-0 border-r border-border/40 py-3 text-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Waktu
        </span>
      </div>
      {dayLabels.map(label => (
        <div
          key={label}
          className="flex-1 py-3 text-center border-r border-border/40 last:border-0"
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
