/** Formato de textos en español. Usa espacios de no separación para que "p. m." no se parta. */

export const NBSP = ' ';

export function meridiem(hour: number): string {
  return hour >= 12 ? `p.${NBSP}m.` : `a.${NBSP}m.`;
}

function to12(hour: number): number {
  return hour > 12 ? hour - 12 : hour;
}

/** `14` → `2:00 p. m.` */
export function formatHour(hour: number): string {
  return `${to12(hour)}:00${NBSP}${meridiem(hour)}`;
}

/** `14` → `2 p. m.` */
export function formatHourShort(hour: number): string {
  return `${to12(hour)}${NBSP}${meridiem(hour)}`;
}

/** `(13, 50)` → `1:50 p. m.` */
export function formatClock(hour: number, minute: number): string {
  const mm = minute < 10 ? `0${minute}` : String(minute);
  return `${to12(hour)}:${mm}${NBSP}${meridiem(hour)}`;
}

/** Franja de una hora: `14` → `2:00 a 3:00 p. m.` */
export function formatRange(hour: number): string {
  return `${to12(hour)}:00 a ${to12(hour + 1)}:00${NBSP}${meridiem(hour + 1)}`;
}

/** Un decimal con coma: `4.25` → `4,3`. */
export function formatDecimal(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1).replace('.', ',');
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/** `1` → `1 persona`, `4` → `4 personas`. */
export function formatPeople(count: number): string {
  return `${count} ${pluralize(count, 'persona', 'personas')}`;
}
