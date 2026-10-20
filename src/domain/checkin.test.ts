import { checkIn, pendingNames } from './reservations';
import { createSeed } from './seed';
import type { Booking } from './types';

const seed = () => createSeed().bookings as Booking[];

describe('checkIn', () => {
  it('is only allowed inside the window', () => {
    // Cancha múltiple pasado mañana: la ventana aún no abre.
    expect(checkIn(seed(), 'val', 'RSV-4907')).toEqual({ ok: false, error: 'outside-window' });
    expect(checkIn(seed(), 'val', 'RSV-0000')).toEqual({ ok: false, error: 'not-found' });
  });

  it('adds one hour of use per check-in', () => {
    const result = checkIn(seed(), 'val', 'RSV-4821');
    expect(result.ok && result.hoursAdded).toBe(1);
  });

  it('leaves the bonus pending until everyone checked in', () => {
    const result = checkIn(seed(), 'val', 'RSV-4821');
    if (!result.ok) throw new Error('setup');
    expect(result.awards).toEqual([]);
    expect(result.outcome).toMatchObject({ kind: 'pending', points: 0 });
    expect(result.outcome?.message).toBe('Se entrega cuando haga check-in Laura.');
    expect(pendingNames(result.bookings[0]!)).toEqual(['Laura']);
  });

  it('awards 20 to the owner and 5 to the joiner once the last one checks in', () => {
    const first = checkIn(seed(), 'val', 'RSV-4821');
    if (!first.ok) throw new Error('setup');
    const second = checkIn(first.bookings, 'lau', 'RSV-4822');
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.awards.map((a) => [a.userId, a.entry.points])).toEqual([
      ['val', 20],
      ['lau', 5],
    ]);
    expect(second.outcome).toMatchObject({ kind: 'awarded', points: 5 });
    expect(second.outcome?.message).toContain('Valentina recibe 20');
    expect(second.bookings[0]?.awarded).toBe(true);
  });

  it('tells the owner who else checked in when the bonus is delivered', () => {
    const first = checkIn(seed(), 'lau', 'RSV-4822');
    if (!first.ok) throw new Error('setup');
    expect(first.outcome?.message).toBe('Se entrega cuando haga check-in Valentina.');
    const second = checkIn(first.bookings, 'val', 'RSV-4821');
    expect(second.ok && second.outcome).toMatchObject({ kind: 'awarded', points: 20 });
    expect(second.ok && second.outcome?.message).toBe(
      'Liberaste el 50% y Laura también hizo check-in. Laura recibe 5.',
    );
  });

  it('does not allow a second check-in for the same reservation', () => {
    const first = checkIn(seed(), 'val', 'RSV-4821');
    if (!first.ok) throw new Error('setup');
    expect(checkIn(first.bookings, 'val', 'RSV-4821')).toEqual({
      ok: false,
      error: 'already-checked-in',
    });
  });

  it('gives no bonus when nobody took the released part', () => {
    // Valentina reserva y libera, nadie toma, hace check-in.
    const bookings: Booking[] = [
      {
        id: 9,
        spaceId: 'b310',
        day: 0,
        hour: 14,
        owner: 'val',
        rid: 'RSV-1',
        released: 50,
        ownerDone: false,
        awarded: false,
        members: [],
      },
    ];
    const result = checkIn(bookings, 'val', 'RSV-1');
    expect(result.ok && result.awards).toEqual([]);
    expect(result.ok && result.outcome).toMatchObject({ kind: 'unclaimed', points: 0 });
  });

  it('says nothing about the bonus when the space was not shared', () => {
    const bookings: Booking[] = [
      {
        id: 9,
        spaceId: 'b310',
        day: 0,
        hour: 14,
        owner: 'val',
        rid: 'RSV-1',
        released: 0,
        ownerDone: false,
        awarded: false,
        members: [],
      },
    ];
    const result = checkIn(bookings, 'val', 'RSV-1');
    expect(result.ok && result.outcome).toBeNull();
    expect(result.ok && result.awards).toEqual([]);
  });

  it('gives only the joiner bonus when the first student was anonymous', () => {
    const bookings: Booking[] = [
      {
        id: 9,
        spaceId: 'b310',
        day: 0,
        hour: 14,
        owner: 'anon',
        rid: null,
        released: 50,
        ownerDone: true,
        awarded: false,
        members: [{ uid: 'val', pct: 50, rid: 'RSV-1', done: false }],
      },
    ];
    const result = checkIn(bookings, 'val', 'RSV-1');
    expect(result.ok && result.awards.map((a) => [a.userId, a.entry.points])).toEqual([['val', 5]]);
    expect(result.ok && result.outcome?.message).toBe(
      'Tomaste el 50% que liberó otro estudiante y todos hicieron check-in.',
    );
  });
});
