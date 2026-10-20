import { slotsForDay } from '@/domain/availability';
import { createActions } from './actions';
import type { AppEvent } from './events';
import { ranking, totalPoints } from './selectors';
import { createInitialState, type AppState } from './state';
import { createStore } from './store';

/** Arma las acciones sobre un estado en memoria, igual que lo hace el StoreProvider. */
function harness(initial: AppState = createInitialState()) {
  const store = createStore(initial);
  const events: AppEvent[] = [];
  const actions = createActions({
    getState: store.getState,
    emit: (event) => {
      events.push(event);
      store.emit(event);
    },
  });
  return {
    actions,
    get state() {
      return store.getState();
    },
    events,
  };
}

/** Horas del día sin ocupación de base, donde el primero reserva el espacio completo. */
function freeHours(spaceId: string, day: number): number[] {
  return slotsForDay([], spaceId, day)
    .filter((s) => s.kind === 'free')
    .map((s) => s.hour);
}

const VAL = 'valentina.rios@correo.usbcali.edu.co';
const LAU = 'laura.mejia@correo.usbcali.edu.co';

describe('sesión', () => {
  it('inicia y cierra sesión', () => {
    const app = harness();
    expect(app.actions.login(VAL, 'mala')).toMatchObject({ ok: false });
    expect(app.state.session).toBeNull();
    expect(app.actions.login(VAL, 'usb2026')).toMatchObject({ ok: true });
    expect(app.state.session).toBe('val');
    app.actions.logout();
    expect(app.state.session).toBeNull();
  });

  it('sin sesión no se puede operar sobre reservas', () => {
    const app = harness();
    expect(app.actions.cancel('RSV-4821')).toEqual({ ok: false, error: 'not-found' });
    expect(app.actions.checkIn('RSV-4821')).toEqual({ ok: false, error: 'not-found' });
    expect(app.events).toHaveLength(0);
  });
});

describe('flujo compartido entre Valentina y Laura', () => {
  it('ambas hacen check-in y se entregan 20 + 5 puntos una sola vez', () => {
    const app = harness();
    app.actions.login(VAL, 'usb2026');
    expect(totalPoints(app.state, 'val')).toBe(30);

    const first = app.actions.checkIn('RSV-4821');
    expect(first.ok && first.outcome?.kind).toBe('pending');
    expect(app.state.hours.val).toBe(13);
    expect(totalPoints(app.state, 'val')).toBe(30);

    app.actions.logout();
    app.actions.login(LAU, 'usb2026');
    const second = app.actions.checkIn('RSV-4822');
    expect(second.ok && second.outcome?.kind).toBe('awarded');
    expect(app.state.hours.lau).toBe(7);
    expect(totalPoints(app.state, 'val')).toBe(50);
    expect(totalPoints(app.state, 'lau')).toBe(5);

    // No se puede repetir.
    expect(app.actions.checkIn('RSV-4822')).toEqual({ ok: false, error: 'already-checked-in' });
    expect(totalPoints(app.state, 'lau')).toBe(5);
  });

  it('Laura no puede operar sobre la reserva de Valentina', () => {
    const app = harness();
    app.actions.login(LAU, 'usb2026');
    expect(app.actions.cancel('RSV-4821')).toEqual({ ok: false, error: 'not-found' });
    expect(app.actions.checkIn('RSV-4821')).toEqual({ ok: false, error: 'not-found' });
  });
});

describe('reservar, liberar y cancelar', () => {
  it('genera códigos consecutivos y avanza los contadores', () => {
    const app = harness();
    app.actions.login(VAL, 'usb2026');
    const [h1, h2] = freeHours('b310', 3);
    const a = app.actions.reserve('b310', 3, h1!, null);
    const b = app.actions.reserve('b310', 3, h2!, null);
    expect(a.ok && a.rid).toBe('RSV-4912');
    expect(b.ok && b.rid).toBe('RSV-4913');
    expect(app.state.counters.reservation).toBe(4914);
    expect(app.state.counters.booking).toBeGreaterThan(3);
  });

  it('un error de reglas no cambia el estado', () => {
    const app = harness();
    app.actions.login(VAL, 'usb2026');
    const before = app.state;
    expect(app.actions.reserve('b204', 0, 9, null)).toMatchObject({ ok: false, error: 'past' });
    expect(app.state).toBe(before);
  });

  it('libera una parte y la cancelación de quien la tomó la vuelve a dejar libre', () => {
    const app = harness();
    app.actions.login(LAU, 'usb2026');
    const cancel = app.actions.cancel('RSV-4822');
    expect(cancel.ok && cancel.spaceFreed).toBe(false);

    app.actions.logout();
    app.actions.login(VAL, 'usb2026');
    const bookingId = app.state.bookings.find((b) => b.rid === 'RSV-4821')!.id;
    expect(app.actions.release(bookingId, 25)).toMatchObject({
      ok: false,
      error: 'already-released',
    });
  });
});

describe('promedio y top', () => {
  it('Laura entra al top al registrar su promedio', () => {
    const app = harness();
    app.actions.login(LAU, 'usb2026');
    expect(ranking(app.state).ranked.some((s) => s.userId === 'lau')).toBe(false);
    expect(app.actions.saveGrade('6')).toMatchObject({ ok: false });
    expect(app.state.grades.lau).toBeNull();
    expect(app.actions.saveGrade('4,5')).toEqual({ ok: true, value: 4.5 });
    expect(ranking(app.state).ranked.some((s) => s.userId === 'lau')).toBe(true);
  });
});

describe('reportes', () => {
  it('no envía sin categoría o con descripción corta', () => {
    const app = harness();
    expect(
      app.actions.sendReport({ spaceId: 'b204', category: '', description: 'La silla está rota' }),
    ).toEqual({ ok: false });
    expect(
      app.actions.sendReport({ spaceId: 'b204', category: 'Mobiliario', description: 'rota' }),
    ).toEqual({ ok: false });
    expect(app.state.reports).toHaveLength(0);
  });

  it('entrega un número de seguimiento consecutivo', () => {
    const app = harness();
    const first = app.actions.sendReport({
      spaceId: 'b204',
      category: 'Mobiliario',
      description: '  La silla está rota  ',
    });
    const second = app.actions.sendReport({
      spaceId: 'l101',
      category: 'Tecnología',
      description: 'El proyector no enciende',
    });
    expect(first.ok && first.report).toMatchObject({
      id: 'REP-1041',
      description: 'La silla está rota',
    });
    expect(second.ok && second.report.id).toBe('REP-1042');
    expect(app.state.reports.map((r) => r.id)).toEqual(['REP-1042', 'REP-1041']);
  });
});
