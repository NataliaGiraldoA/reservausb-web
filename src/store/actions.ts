import { TODAY_SHORT } from '@/domain/constants';
import {
  cancelReservation,
  checkIn,
  releasePart,
  reserve,
  type CancelResult,
  type CheckInResult,
  type ReleaseResult,
  type ReserveResult,
} from '@/domain/reservations';
import {
  isReportReady,
  parseGrade,
  validateLogin,
  type GradeResult,
  type LoginResult,
} from '@/domain/validators';
import type { DamageReport, ReportCategory, SharePercent, UserId } from '@/domain/types';
import type { AppEvent } from './events';
import type { AppState } from './state';

export type ReserveOutcome = ReserveResult & { readonly rid?: string };

export interface ReportDraft {
  readonly spaceId: string;
  readonly category: ReportCategory | '';
  readonly description: string;
}

export type ReportOutcome =
  { readonly ok: true; readonly report: DamageReport } | { readonly ok: false };

export interface Actions {
  /** Inicia sesión si las credenciales son válidas. */
  login(email: string, password: string): LoginResult;
  logout(): void;
  reserve(spaceId: string, day: number, hour: number, percent: SharePercent | null): ReserveOutcome;
  release(bookingId: number, percent: SharePercent): ReleaseResult;
  cancel(rid: string): CancelResult;
  checkIn(rid: string): CheckInResult;
  saveGrade(raw: string): GradeResult;
  sendReport(draft: ReportDraft): ReportOutcome;
}

interface Port {
  getState(): AppState;
  emit(event: AppEvent): void;
}

/**
 * Comandos de la app: leen el estado actual, aplican las reglas del dominio y, si son válidas,
 * emiten el evento. Devuelven el resultado para que la pantalla decida cómo mostrarlo.
 * Todas las operaciones sobre reservas se limitan al estudiante con sesión iniciada.
 */
export function createActions({ getState, emit }: Port): Actions {
  const sessionUser = (): UserId | null => getState().session;

  return {
    login(email, password) {
      const result = validateLogin(email, password);
      if (result.ok) emit({ type: 'signed-in', userId: result.user.id });
      return result;
    },

    logout() {
      emit({ type: 'signed-out' });
    },

    reserve(spaceId, day, hour, percent) {
      const state = getState();
      const userId = sessionUser();
      if (!userId) return { ok: false, error: 'unknown-space' };
      const rid = `RSV-${state.counters.reservation}`;
      const result = reserve(state.bookings, {
        spaceId,
        day,
        hour,
        userId,
        percent,
        rid,
        bookingId: state.counters.booking,
      });
      if (!result.ok) return result;
      emit({ type: 'reserved', bookings: result.bookings, booking: result.booking });
      return { ...result, rid };
    },

    release(bookingId, percent) {
      const userId = sessionUser();
      if (!userId) return { ok: false, error: 'not-owner' };
      const result = releasePart(getState().bookings, bookingId, userId, percent);
      if (result.ok) emit({ type: 'released', bookings: result.bookings });
      return result;
    },

    cancel(rid) {
      const userId = sessionUser();
      if (!userId) return { ok: false, error: 'not-found' };
      const result = cancelReservation(getState().bookings, userId, rid);
      if (result.ok) emit({ type: 'canceled', bookings: result.bookings });
      return result;
    },

    checkIn(rid) {
      const userId = sessionUser();
      if (!userId) return { ok: false, error: 'not-found' };
      const result = checkIn(getState().bookings, userId, rid);
      if (result.ok) {
        emit({ type: 'checked-in', userId, bookings: result.bookings, awards: result.awards });
      }
      return result;
    },

    saveGrade(raw) {
      const userId = sessionUser();
      const result = parseGrade(raw);
      if (result.ok && userId) emit({ type: 'grade-saved', userId, grade: result.value });
      return result;
    },

    sendReport(draft) {
      const { category, description, spaceId } = draft;
      if (!isReportReady(category, description)) return { ok: false };
      const report: DamageReport = {
        id: `REP-${getState().counters.report}`,
        spaceId,
        category,
        description: description.trim(),
        date: TODAY_SHORT,
      };
      emit({ type: 'report-sent', report });
      return { ok: true, report };
    },
  };
}
