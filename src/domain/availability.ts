import { BASE_OCCUPANCY, HOURS, NOW, SPACES } from './constants';
import type { Booking, SharePercent, Space, UserId } from './types';

/** Cantidad de personas que representa un porcentaje del espacio (mínimo 1). */
export function peopleFor(space: Space, percent: number): number {
  return Math.max(1, Math.round((space.capacity * percent) / 100));
}

export function getSpace(spaceId: string): Space | undefined {
  return SPACES.find((space) => space.id === spaceId);
}

/** Una franja ya pasó si es hoy y su hora de inicio es la actual o anterior. */
export function isPast(day: number, hour: number): boolean {
  return day === NOW.day && hour <= NOW.hour;
}

/**
 * Ocupación de partida de una franja sin reserva de la sesión: simula que otros estudiantes
 * ya reservaron y liberaron parte del espacio. Es determinista para cada espacio, día y hora.
 */
export function baseOccupancy(spaceId: string, day: number, hour: number): number {
  const index = Math.max(
    0,
    SPACES.findIndex((space) => space.id === spaceId),
  );
  const slot =
    ((index + 1) * 31 + (day + 1) * 17 + hour * hour * 3 + hour * 13) % BASE_OCCUPANCY.length;
  return BASE_OCCUPANCY[slot] ?? 0;
}

export function findBooking(
  bookings: readonly Booking[],
  spaceId: string,
  day: number,
  hour: number,
): Booking | undefined {
  return bookings.find((b) => b.spaceId === spaceId && b.day === day && b.hour === hour);
}

/** Porcentaje del espacio que ya tomaron quienes se unieron. */
export function takenPercent(booking: Booking): number {
  return booking.members.reduce((sum, member) => sum + member.pct, 0);
}

/** Porcentaje que todavía pueden tomar otros estudiantes en una reserva. */
export function availableInBooking(booking: Booking): number {
  if (booking.owner === null) return 100 - takenPercent(booking);
  return Math.max(0, booking.released - takenPercent(booking));
}

/** Porcentaje ocupado (0 a 100) de una franja. */
export function occupancy(
  bookings: readonly Booking[],
  spaceId: string,
  day: number,
  hour: number,
): number {
  const booking = findBooking(bookings, spaceId, day, hour);
  if (booking) return 100 - availableInBooking(booking);
  return baseOccupancy(spaceId, day, hour);
}

export type SlotKind =
  /** Ya pasó. */
  | 'past'
  /** No queda nada por tomar. */
  | 'full'
  /** Nadie la ha reservado: el primero se queda con el espacio completo. */
  | 'free'
  /** Alguien reservó y liberó una parte que se puede tomar. */
  | 'shared'
  /** La persona ya participa en esta franja. */
  | 'mine';

export interface SlotState {
  readonly kind: SlotKind;
  readonly hour: number;
  /** Porcentaje ocupado. */
  readonly occupied: number;
  /** Porcentaje que se puede tomar. */
  readonly available: number;
}

export function slotState(
  bookings: readonly Booking[],
  spaceId: string,
  day: number,
  hour: number,
  userId: UserId | null = null,
): SlotState {
  const occupied = occupancy(bookings, spaceId, day, hour);
  const available = 100 - occupied;
  const base = { hour, occupied, available };
  if (isPast(day, hour)) return { ...base, kind: 'past' };
  const booking = findBooking(bookings, spaceId, day, hour);
  if (booking && userId && participates(booking, userId)) return { ...base, kind: 'mine' };
  if (available <= 0) return { ...base, kind: 'full' };
  if (occupied === 0) return { ...base, kind: 'free' };
  return { ...base, kind: 'shared' };
}

export function slotsForDay(
  bookings: readonly Booking[],
  spaceId: string,
  day: number,
  userId: UserId | null = null,
): SlotState[] {
  return HOURS.map((hour) => slotState(bookings, spaceId, day, hour, userId));
}

/** Franjas del día que aún se pueden reservar o compartir. */
export function slotsWithRoom(bookings: readonly Booking[], spaceId: string, day: number): number {
  return HOURS.filter((hour) => !isPast(day, hour) && occupancy(bookings, spaceId, day, hour) < 100)
    .length;
}

/** Porcentajes entre 25, 50 y 75 que caben en lo que hay disponible. */
export function selectablePercents(available: number): SharePercent[] {
  return ([25, 50, 75] as const).filter((pct) => pct <= available);
}

export function participates(booking: Booking, userId: UserId): boolean {
  return booking.owner === userId || booking.members.some((m) => m.uid === userId);
}

/**
 * Hora que se muestra de partida en el tablero de la portada: la primera franja futura de hoy
 * que está parcialmente ocupada; si no hay, la primera con cupo.
 */
export function highlightHour(bookings: readonly Booking[], spaceId: string): number {
  let firstWithRoom: number | null = null;
  for (const hour of HOURS) {
    if (isPast(0, hour)) continue;
    const occ = occupancy(bookings, spaceId, 0, hour);
    if (occ > 0 && occ < 100) return hour;
    if (firstWithRoom === null && occ < 100) firstWithRoom = hour;
  }
  return firstWithRoom ?? 14;
}
