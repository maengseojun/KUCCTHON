function pad2(value: number) {
  return value.toString().padStart(2, '0');
}

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function toLocalDateKey(date: Date) {
  return toDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function isValidDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

export function getYearlyOccurrenceDate(eventDate: string, year: number) {
  const [, month, day] = eventDate.split('-').map(Number);
  return toDateKey(year, month, day);
}

export function getYearlyOccurrenceOnOrAfter(eventDate: string, fromDate: string) {
  const fromYear = Number(fromDate.slice(0, 4));
  const [, month, day] = eventDate.split('-').map(Number);
  const thisYearOccurrence = toDateKey(fromYear, month, day);

  return thisYearOccurrence >= fromDate ? thisYearOccurrence : toDateKey(fromYear + 1, month, day);
}
