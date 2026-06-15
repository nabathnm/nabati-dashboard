const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarWeekdaysRow() {
    return (
        <div className="grid grid-cols-7 border-b border-border/50 bg-muted/20">
            {weekDays.map((dayName) => (
                <div
                    key={dayName}
                    className="py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                    {dayName}
                </div>
            ))}
        </div>
    );
}