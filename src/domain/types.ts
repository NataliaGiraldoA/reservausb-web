/** Tipos del dominio de ReservaUSB. No dependen de React ni del navegador. */

export type SpaceType = 'sala' | 'cancha' | 'lab';

export interface Space {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly type: SpaceType;
  readonly where: string;
  /** Capacidad en personas. */
  readonly capacity: number;
}

export type UserId = 'val' | 'lau';

export interface User {
  readonly id: UserId;
  readonly name: string;
  readonly firstName: string;
  readonly email: string;
}

/** Porcentajes que se pueden liberar o tomar de un espacio. */
export type SharePercent = 25 | 50 | 75;

/**
 * Quién reservó primero una franja:
 * - un usuario de la app,
 * - `'anon'`: otro estudiante que no usa esta sesión (datos de demostración),
 * - `null`: quien reservó primero canceló y quedan solo quienes tomaron una parte.
 */
export type BookingOwner = UserId | 'anon' | null;

/** Estudiante que tomó una parte liberada. */
export interface Member {
  readonly uid: UserId;
  readonly pct: SharePercent;
  /** Código de reserva de esta parte. */
  readonly rid: string;
  /** Ya hizo check-in. */
  readonly done: boolean;
}

/** Una franja de un espacio en un día, con quien la reservó y quienes tomaron partes. */
export interface Booking {
  readonly id: number;
  readonly spaceId: string;
  /** 0 = hoy, 1..6 = los días siguientes. */
  readonly day: number;
  /** Hora de inicio en formato de 24 horas (7 a 19). */
  readonly hour: number;
  readonly owner: BookingOwner;
  readonly rid: string | null;
  /** Porcentaje del espacio que quien reservó primero liberó para otros. */
  readonly released: number;
  readonly ownerDone: boolean;
  /** La bonificación de puntos ya se entregó. */
  readonly awarded: boolean;
  readonly members: readonly Member[];
}

/** Vista de una reserva desde el punto de vista de un estudiante. */
export interface Reservation {
  readonly rid: string;
  readonly booking: Booking;
  readonly isOwner: boolean;
  /** Parte del espacio que le corresponde (100 si reservó primero). */
  readonly pct: number;
  readonly done: boolean;
}

export type CheckInWindow = 'before' | 'open' | 'after';

export interface PointEntry {
  readonly text: string;
  readonly date: string;
  readonly points: number;
}

export type ReportCategory = 'Mobiliario' | 'Eléctrico' | 'Tecnología' | 'Limpieza' | 'Otro';

export interface DamageReport {
  readonly id: string;
  readonly spaceId: string;
  readonly category: ReportCategory;
  readonly description: string;
  readonly date: string;
}

/** Datos mínimos de un estudiante para calcular el top. */
export interface Student {
  readonly name: string;
  readonly points: number;
  /** Promedio de notas de 0,0 a 5,0. `null` si aún no lo registró. */
  readonly grade: number | null;
  readonly hours: number;
  readonly userId: UserId | null;
}

export interface RankedStudent extends Student {
  readonly pointsRatio: number;
  readonly gradeRatio: number;
  readonly hoursRatio: number;
  /** Índice de 0 a 100. */
  readonly index: number;
  /** Posición en el top. `null` si no tiene promedio y por eso no aparece. */
  readonly position: number | null;
}

export interface Ranking {
  readonly all: readonly RankedStudent[];
  /** Solo quienes tienen promedio, de mayor a menor índice. */
  readonly ranked: readonly RankedStudent[];
  readonly maxPoints: number;
  readonly maxHours: number;
}

/**
 * Lo que el estudiante debe saber después de un check-in sobre la bonificación.
 * - `awarded`: se entregó (`points` es lo que recibe quien hizo el check-in).
 * - `pending`: falta que otros hagan check-in.
 * - `unclaimed`: quien reservó primero liberó una parte y nadie la tomó.
 */
export type CheckInOutcome =
  | { readonly kind: 'awarded'; readonly points: number; readonly message: string }
  | { readonly kind: 'pending'; readonly points: 0; readonly message: string }
  | { readonly kind: 'unclaimed'; readonly points: 0; readonly message: string };
