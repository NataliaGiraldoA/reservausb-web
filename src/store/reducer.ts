import type { AppEvent } from './events';
import type { AppState } from './state';

export function reducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'signed-in':
      return { ...state, session: event.userId };

    case 'signed-out':
      return { ...state, session: null };

    case 'reserved':
      return {
        ...state,
        bookings: event.bookings,
        counters: {
          ...state.counters,
          reservation: state.counters.reservation + 1,
          booking: Math.max(state.counters.booking, event.booking.id + 1),
        },
      };

    case 'released':
    case 'canceled':
      return { ...state, bookings: event.bookings };

    case 'checked-in': {
      const points = { ...state.points };
      for (const { userId, entry } of event.awards) {
        points[userId] = [...points[userId], entry];
      }
      return {
        ...state,
        bookings: event.bookings,
        points,
        hours: { ...state.hours, [event.userId]: state.hours[event.userId] + 1 },
      };
    }

    case 'grade-saved':
      return { ...state, grades: { ...state.grades, [event.userId]: event.grade } };

    case 'report-sent':
      return {
        ...state,
        reports: [event.report, ...state.reports],
        counters: { ...state.counters, report: state.counters.report + 1 },
      };
  }
}
