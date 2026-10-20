import { CHECK_IN_MINUTES_AFTER, CHECK_IN_MINUTES_BEFORE, DAYS } from './constants';
import { isPast, peopleFor } from './availability';
import { formatClock, formatPeople } from './format';
import { checkInWindow, joinNames, ownerLabel } from './reservations';
import type { Booking, Reservation, Space } from './types';

/** `0` → `Hoy`; `2` → `Miércoles 30 de septiembre`. */
export function dayLabel(day: number): string {
  return day === 0 ? 'Hoy' : (DAYS[day]?.label ?? '');
}

/** `0` → `Hoy, lunes 28 de septiembre`. */
export function dayFullLabel(day: number): string {
  return DAYS[day]?.label ?? '';
}

/** Descripción corta de una hora para lectores de pantalla y para el tablero de la portada. */
export function describeHour(space: Space, day: number, hour: number, occupied: number): string {
  if (isPast(day, hour)) return 'ya pasó';
  if (occupied === 0) return `libre, cupo para ${formatPeople(space.capacity)}`;
  if (occupied >= 100) return 'llena';
  const room = peopleFor(space, 100 - occupied);
  return `${occupied}% ocupado, cupo para ${room} de ${formatPeople(space.capacity)}`;
}

/** Texto de la ventana de check-in según la hora simulada. */
export function checkInWindowText(booking: Pick<Booking, 'day' | 'hour'>): string {
  switch (checkInWindow(booking)) {
    case 'open':
      return `Check-in disponible de ${formatClock(booking.hour - 1, 60 - CHECK_IN_MINUTES_BEFORE)} a ${formatClock(booking.hour, CHECK_IN_MINUTES_AFTER)} Si no lo haces a tiempo, la reserva se libera.`;
    case 'before':
      return `El check-in se habilita ${CHECK_IN_MINUTES_BEFORE} minutos antes del inicio (${formatClock(booking.hour - 1, 60 - CHECK_IN_MINUTES_BEFORE)}${booking.day ? `, ${dayFullLabel(booking.day).toLowerCase()}` : ''}).`;
    case 'after':
      return `La ventana de check-in terminó ${CHECK_IN_MINUTES_AFTER} minutos después del inicio, así que la reserva se libera.`;
  }
}

/** Cómo participa la persona en una reserva: quién reservó primero y con quién comparte. */
export function participationText(reservation: Reservation, space: Space): string {
  const { booking } = reservation;
  if (!reservation.isOwner) {
    return `Tu parte: ${reservation.pct}% (${formatPeople(peopleFor(space, reservation.pct))}). Reservó primero ${ownerLabel(booking.owner)}.`;
  }
  const members = joinNames(booking.members.map((m) => `${ownerLabel(m.uid)} (${m.pct}%)`));
  const released = booking.released
    ? `, liberaste ${booking.released}%${members ? ` y lo tomó ${members}` : ', aún nadie lo ha tomado'}`
    : '';
  return `Reservaste el espacio completo${released}.`;
}

/** Texto de confirmación para cancelar una reserva. */
export function cancelDescription(
  reservation: Reservation,
  space: Space,
  rangeText: string,
): string {
  const { booking } = reservation;
  const when = booking.day === 0 ? 'hoy' : dayFullLabel(booking.day).toLowerCase();
  const effect = reservation.isOwner
    ? booking.members.length
      ? 'Tu parte quedará libre; quienes tomaron la parte liberada conservan la suya.'
      : 'El espacio quedará libre para otros estudiantes.'
    : `Tu ${reservation.pct}% volverá a quedar disponible.`;
  return `${space.name}, ${when} de ${rangeText}. ${effect}`;
}
