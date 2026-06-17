interface ScheduleRowProps {
    dayLabels: string[];
}

export default function CalendarRow({ dayLabels }: ScheduleRowProps) {
    return (
        <div className="flex border-b border-primary/20 bg-primary">
            <div className="w-16 shrink-0 border-r border-primary/20 py-3 text-center">
                <span className="text-xs font-bold text-primary-foreground uppercase tracking-wider">
                    Time
                </span>
            </div>
            {dayLabels.map((label) => (
                <div
                    key={label}
                    className="flex-1 py-3 text-center border-r border-primary/20 last:border-0"
                >
                    <span className="text-xs font-bold text-primary-foreground uppercase tracking-wider">
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
}