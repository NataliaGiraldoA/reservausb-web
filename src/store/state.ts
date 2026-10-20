import { createSeed } from '@/domain/seed';
import type { Booking, DamageReport, PointEntry, UserId } from '@/domain/types';

export interface AppState {
  /** Estudiante con sesión iniciada. */
  readonly session: UserId | null;
  readonly bookings: readonly Booking[];
  readonly points: Readonly<Record<UserId, readonly PointEntry[]>>;
  readonly grades: Readonly<Record<UserId, number | null>>;
  readonly hours: Readonly<Record<UserId, number>>;
  readonly reports: readonly DamageReport[];
  /** Siguientes números para generar códigos. */
  readonly counters: {
    readonly reservation: number;
    readonly booking: number;
    readonly report: number;
  };
}

export function createInitialState(): AppState {
  return { session: null, ...createSeed() };
}
