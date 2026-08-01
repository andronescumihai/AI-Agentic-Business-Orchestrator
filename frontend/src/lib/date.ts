/** Luni ca prima zi a săptămânii (convenție RO/UE). */
export function getMonday(from: Date): Date {
  const date = new Date(from);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Cele 7 zile (luni-duminică) ale săptămânii curente + `weekOffset` săptămâni. */
export function getWeekDays(weekOffset: number): Date[] {
  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** Interval [start, end) pentru o săptămână, ca ISO strings, pentru query-uri Supabase. */
export function getWeekRange(weekOffset: number): { start: string; end: string; days: Date[] } {
  const days = getWeekDays(weekOffset);
  const start = days[0];
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start: start.toISOString(), end: end.toISOString(), days };
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
