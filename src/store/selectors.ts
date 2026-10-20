import { OTHER_STUDENTS, USERS } from '@/domain/constants';
import { buildRanking } from '@/domain/ranking';
import { reservationsOf } from '@/domain/reservations';
import type { Ranking, Reservation, Student, User, UserId } from '@/domain/types';
import type { AppState } from './state';

export function totalPoints(state: AppState, userId: UserId): number {
  return state.points[userId].reduce((sum, entry) => sum + entry.points, 0);
}

export function sessionUser(state: AppState): User | null {
  return state.session ? USERS[state.session] : null;
}

export function myReservations(state: AppState): Reservation[] {
  return state.session ? reservationsOf(state.bookings, state.session) : [];
}

/** Todos los estudiantes del top: los ficticios y las dos cuentas de demostración. */
export function students(state: AppState): Student[] {
  const accounts = (Object.keys(USERS) as UserId[]).map<Student>((id) => ({
    name: USERS[id].name,
    points: totalPoints(state, id),
    grade: state.grades[id],
    hours: state.hours[id],
    userId: id,
  }));
  return [...OTHER_STUDENTS, ...accounts];
}

export function ranking(state: AppState): Ranking {
  return buildRanking(students(state));
}
