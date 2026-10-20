import {
  CHECK_IN_MINUTES_AFTER,
  CHECK_IN_MINUTES_BEFORE,
  NOW,
  POINTS_JOINER,
  POINTS_OWNER,
  TODAY_SHORT,
  USERS,
} from './constants';
import {
  baseOccupancy,
  findBooking,
  getSpace,
  selectablePercents,
  slotState,
} from './availability';
import type {
  Booking,
  BookingOwner,
  CheckInOutcome,
  CheckInWindow,
  PointEntry,
  Reservation,
  SharePercent,
  UserId,
} from './types';

/** Nombre corto de quien reservó primero, o un texto neutro si no se conoce. */
export function ownerLabel(owner: BookingOwner): string {
  return owner === null || owner === 'anon' ? 'otro estudiante' : USERS[owner].firstName;
}

export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

// ───────────────────────── Consultas ─────────────────────────

/** Reservas activas de un estudiante, de la más próxima a la más lejana. */
export function reservationsOf(bookings: readonly Booking[], userId: UserId): Reservation[] {
  const out: Reservation[] = [];
  for (const booking of bookings) {
    if (booking.owner === userId && booking.rid) {
      out.push({ rid: booking.rid, booking, isOwner: true, pct: 100, done: booking.ownerDone });
    }
    for (const member of booking.members) {
      if (member.uid === userId) {
        out.push({ rid: member.rid, booking, isOwner: false, pct: member.pct, done: member.done });
      }
    }
  }
  return out.sort((a, b) => a.booking.day - b.booking.day || a.booking.hour - b.booking.hour);
}

export function findReservation(
  bookings: readonly Booking[],
  userId: UserId,
  rid: string,
): Reservation | undefined {
  return reservationsOf(bookings, userId).find((r) => r.rid === rid);
}

export function findBookingById(
  bookings: readonly Booking[],
  bookingId: number,
): Booking | undefined {
  return bookings.find((b) => b.id === bookingId);
}

// ───────────────────────── Reservar ─────────────────────────

export type ReserveError =
  'unknown-space' | 'past' | 'full' | 'already-in' | 'needs-percent' | 'percent-too-large';

export interface ReserveInput {
  readonly spaceId: string;
  readonly day: number;
  readonly hour: number;
  readonly userId: UserId;
  /** Obligatorio al unirse a una franja compartida; se ignora si la franja está libre. */
  readonly percent: SharePercent | null;
  /** Código de la nueva reserva. */
  readonly rid: string;
  /** Identificador a usar si hay que crear una reserva nueva. */
  readonly bookingId: number;
}

export type ReserveResult =
  | { readonly ok: true; readonly bookings: Booking[]; readonly booking: Booking }
  | { readonly ok: false; readonly error: ReserveError };

/**
 * El primero en una franja libre reserva el espacio completo. Si otro estudiante ya reservó y
 * liberó una parte, los demás solo pueden tomar 25, 50 o 75% dentro de lo liberado.
 */
export function reserve(bookings: readonly Booking[], input: ReserveInput): ReserveResult {
  const { spaceId, day, hour, userId, percent, rid, bookingId } = input;
  if (!getSpace(spaceId)) return { ok: false, error: 'unknown-space' };

  const slot = slotState(bookings, spaceId, day, hour, userId);
  if (slot.kind === 'past') return { ok: false, error: 'past' };
  if (slot.kind === 'mine') return { ok: false, error: 'already-in' };
  if (slot.kind === 'full') return { ok: false, error: 'full' };

  const existing = findBooking(bookings, spaceId, day, hour);

  if (slot.kind === 'free') {
    const booking: Booking = {
      id: existing?.id ?? bookingId,
      spaceId,
      day,
      hour,
      owner: userId,
      rid,
      released: 0,
      ownerDone: false,
      awarded: false,
      members: [],
    };
    return { ok: true, booking, bookings: [...bookings, booking] };
  }

  if (percent === null) return { ok: false, error: 'needs-percent' };
  if (!selectablePercents(slot.available).includes(percent)) {
    return { ok: false, error: 'percent-too-large' };
  }

  const member = { uid: userId, pct: percent, rid, done: false } as const;
  if (existing) {
    const booking: Booking = { ...existing, members: [...existing.members, member] };
    return { ok: true, booking, bookings: bookings.map((b) => (b === existing ? booking : b)) };
  }

  // La franja tenía ocupación de base: otro estudiante reservó primero y ya liberó lo que queda.
  const booking: Booking = {
    id: bookingId,
    spaceId,
    day,
    hour,
    owner: 'anon',
    rid: null,
    released: 100 - baseOccupancy(spaceId, day, hour),
    ownerDone: true,
    awarded: false,
    members: [member],
  };
  return { ok: true, booking, bookings: [...bookings, booking] };
}

// ───────────────────────── Liberar una parte ─────────────────────────

export type ReleaseError = 'not-found' | 'not-owner' | 'already-released';

export type ReleaseResult =
  | { readonly ok: true; readonly bookings: Booking[]; readonly booking: Booking }
  | { readonly ok: false; readonly error: ReleaseError };

/** Quien reservó primero libera 25, 50 o 75%; esa parte queda disponible de inmediato. */
export function releasePart(
  bookings: readonly Booking[],
  bookingId: number,
  userId: UserId,
  percent: SharePercent,
): ReleaseResult {
  const current = findBookingById(bookings, bookingId);
  if (!current) return { ok: false, error: 'not-found' };
  if (current.owner !== userId) return { ok: false, error: 'not-owner' };
  if (current.released > 0) return { ok: false, error: 'already-released' };
  const booking: Booking = { ...current, released: percent };
  return { ok: true, booking, bookings: bookings.map((b) => (b === current ? booking : b)) };
}

/** Una reserva a la que su dueño todavía puede liberarle una parte. */
export function canRelease(reservation: Reservation): boolean {
  return reservation.isOwner && reservation.booking.released === 0 && !reservation.done;
}

// ───────────────────────── Cancelar ─────────────────────────

export type CancelError = 'not-found' | 'already-checked-in';

export type CancelResult =
  | {
      readonly ok: true;
      readonly bookings: Booking[];
      /** `true` si el espacio completo quedó libre; `false` si solo quedó libre la parte. */
      readonly spaceFreed: boolean;
    }
  | { readonly ok: false; readonly error: CancelError };

/**
 * - Si cancela quien tomó una parte, ese porcentaje vuelve a quedar disponible.
 * - Si cancela quien reservó primero, su parte queda libre y quienes tomaron partes conservan la suya.
 */
export function cancelReservation(
  bookings: readonly Booking[],
  userId: UserId,
  rid: string,
): CancelResult {
  const reservation = findReservation(bookings, userId, rid);
  if (!reservation) return { ok: false, error: 'not-found' };
  if (reservation.done) return { ok: false, error: 'already-checked-in' };

  const current = reservation.booking;
  let next: Booking | null;

  if (reservation.isOwner) {
    next = current.members.length
      ? { ...current, owner: null, rid: null, ownerDone: true, released: 100 }
      : null;
  } else {
    const members = current.members.filter((m) => m.rid !== rid);
    const orphan = members.length === 0 && (current.owner === null || current.owner === 'anon');
    next = orphan ? null : { ...current, members };
  }

  const out = bookings.flatMap((b) => (b !== current ? [b] : next ? [next] : []));
  const spaceFreed = reservation.isOwner && current.members.length === 0;
  return { ok: true, bookings: out, spaceFreed };
}

// ───────────────────────── Check-in ─────────────────────────

/** Ventana del check-in: desde 10 minutos antes hasta 15 minutos después del inicio. */
export function checkInWindow(booking: Pick<Booking, 'day' | 'hour'>): CheckInWindow {
  if (booking.day > NOW.day) return 'before';
  const start = booking.hour * 60;
  const now = NOW.hour * 60 + NOW.minute;
  if (now < start - CHECK_IN_MINUTES_BEFORE) return 'before';
  if (now > start + CHECK_IN_MINUTES_AFTER) return 'after';
  return 'open';
}

export function canCheckIn(reservation: Reservation): boolean {
  return !reservation.done && checkInWindow(reservation.booking) === 'open';
}

/** Nombres de quienes aún no hacen check-in. */
export function pendingNames(booking: Booking): string[] {
  const names: string[] = [];
  if (!booking.ownerDone && booking.owner && booking.owner !== 'anon') {
    names.push(ownerLabel(booking.owner));
  }
  for (const member of booking.members) if (!member.done) names.push(ownerLabel(member.uid));
  return names;
}

/** La bonificación se entrega solo cuando quien reservó primero y todos los que se unieron hicieron check-in. */
export function isFullyChecked(booking: Booking): boolean {
  return booking.ownerDone && booking.members.length > 0 && booking.members.every((m) => m.done);
}

export type CheckInError = 'not-found' | 'already-checked-in' | 'outside-window';

export interface PointAward {
  readonly userId: UserId;
  readonly entry: PointEntry;
}

export type CheckInResult =
  | {
      readonly ok: true;
      readonly bookings: Booking[];
      /** Cada check-in suma 1 hora de uso a quien lo hace. */
      readonly hoursAdded: 1;
      readonly awards: PointAward[];
      /** `null` si la reserva no se comparte y no hay nada que decir de la bonificación. */
      readonly outcome: CheckInOutcome | null;
    }
  | { readonly ok: false; readonly error: CheckInError };

export function checkIn(bookings: readonly Booking[], userId: UserId, rid: string): CheckInResult {
  const reservation = findReservation(bookings, userId, rid);
  if (!reservation) return { ok: false, error: 'not-found' };
  if (reservation.done) return { ok: false, error: 'already-checked-in' };
  if (checkInWindow(reservation.booking) !== 'open') return { ok: false, error: 'outside-window' };

  const current = reservation.booking;
  let booking: Booking = reservation.isOwner
    ? { ...current, ownerDone: true }
    : {
        ...current,
        members: current.members.map((m) => (m.rid === rid ? { ...m, done: true } : m)),
      };

  const awards: PointAward[] = [];
  let outcome: CheckInOutcome | null = null;
  const space = getSpace(booking.spaceId);

  if (booking.members.length > 0) {
    if (!booking.awarded && isFullyChecked(booking) && space) {
      booking = { ...booking, awarded: true };
      if (booking.owner && booking.owner !== 'anon') {
        awards.push({
          userId: booking.owner,
          entry: {
            text: `Liberaste ${booking.released}% de ${space.name} y se usó en compartido`,
            date: TODAY_SHORT,
            points: POINTS_OWNER,
          },
        });
      }
      for (const member of booking.members) {
        awards.push({
          userId: member.uid,
          entry: {
            text: `Tomaste ${member.pct}% de ${space.name} y se usó en compartido`,
            date: TODAY_SHORT,
            points: POINTS_JOINER,
          },
        });
      }
      outcome = awardedOutcome(booking, reservation);
    } else if (!booking.awarded) {
      const waiting = pendingNames(booking);
      outcome = {
        kind: 'pending',
        points: 0,
        message: `Se entrega cuando ${waiting.length > 1 ? 'hagan' : 'haga'} check-in ${joinNames(waiting)}.`,
      };
    }
  } else if (reservation.isOwner && booking.released > 0) {
    outcome = {
      kind: 'unclaimed',
      points: 0,
      message: 'Nadie ha tomado la parte que liberaste, así que esta vez no hay bonificación.',
    };
  }

  const out = bookings.map((b) => (b === current ? booking : b));
  return { ok: true, bookings: out, hoursAdded: 1, awards, outcome };
}

function awardedOutcome(booking: Booking, reservation: Reservation): CheckInOutcome {
  if (reservation.isOwner) {
    const names = booking.members.map((m) => ownerLabel(m.uid));
    const several = names.length > 1;
    return {
      kind: 'awarded',
      points: POINTS_OWNER,
      message:
        `Liberaste el ${booking.released}% y ${joinNames(names)} también ${several ? 'hicieron' : 'hizo'} check-in. ` +
        `${several ? 'Cada uno recibe' : `${names[0]} recibe`} ${POINTS_JOINER}.`,
    };
  }
  const hasOwner = booking.owner !== null && booking.owner !== 'anon';
  return {
    kind: 'awarded',
    points: POINTS_JOINER,
    message:
      `Tomaste el ${reservation.pct}% que liberó ${ownerLabel(booking.owner)} y todos hicieron check-in.` +
      (hasOwner ? ` ${ownerLabel(booking.owner)} recibe ${POINTS_OWNER}.` : ''),
  };
}

// ───────────────────────── Utilidades de lectura ─────────────────────────

/** Quienes comparten la franja con la persona, sin incluirla. */
export function sharedWith(booking: Booking, userId: UserId): string[] {
  const names: string[] = [];
  if (booking.owner !== userId) names.push(ownerLabel(booking.owner));
  for (const member of booking.members)
    if (member.uid !== userId) names.push(ownerLabel(member.uid));
  return names;
}
