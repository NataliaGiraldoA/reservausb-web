import type { PointAward } from '@/domain/reservations';
import type { Booking, DamageReport, UserId } from '@/domain/types';

/**
 * Hechos que ocurrieron en la app. Las acciones (`actions.ts`) validan con las reglas del dominio
 * y emiten estos eventos ya resueltos, de modo que el reducer solo los aplica.
 */
export type AppEvent =
  | { readonly type: 'signed-in'; readonly userId: UserId }
  | { readonly type: 'signed-out' }
  | { readonly type: 'reserved'; readonly bookings: readonly Booking[]; readonly booking: Booking }
  | { readonly type: 'released'; readonly bookings: readonly Booking[] }
  | { readonly type: 'canceled'; readonly bookings: readonly Booking[] }
  | {
      readonly type: 'checked-in';
      readonly userId: UserId;
      readonly bookings: readonly Booking[];
      readonly awards: readonly PointAward[];
    }
  | { readonly type: 'grade-saved'; readonly userId: UserId; readonly grade: number }
  | { readonly type: 'report-sent'; readonly report: DamageReport };
