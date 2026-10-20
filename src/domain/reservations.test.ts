import { occupancy, slotState } from './availability';
import {
  canRelease,
  cancelReservation,
  checkInWindow,
  findReservation,
  releasePart,
  reservationsOf,
  reserve,
  sharedWith,
} from './reservations';
import { createSeed } from './seed';
import type { Booking } from './types';

const seed = () => createSeed().bookings as Booking[];

/** Una franja futura sin ocupación de base: B-204 mañana. Se busca para no depender de la semilla. */
function freeSlot(): { spaceId: string; day: number; hour: number } {
  for (let hour = 7; hour <= 19; hour += 1) {
    if (slotState(seed(), 'b204', 3, hour).kind === 'free')
      return { spaceId: 'b204', day: 3, hour };
  }
  throw new Error('no free slot found');
}

describe('reserve', () => {
  it('first student on a free slot reserves the whole space', () => {
    const slot = freeSlot();
    const result = reserve(seed(), {
      ...slot,
      userId: 'val',
      percent: null,
      rid: 'RSV-1',
      bookingId: 10,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.booking).toMatchObject({ owner: 'val', rid: 'RSV-1', released: 0, members: [] });
    expect(occupancy(result.bookings, slot.spaceId, slot.day, slot.hour)).toBe(100);
  });

  it('ignores a percentage when the slot is free', () => {
    const slot = freeSlot();
    const result = reserve(seed(), {
      ...slot,
      userId: 'val',
      percent: 25,
      rid: 'RSV-1',
      bookingId: 10,
    });
    expect(result.ok && result.booking.members).toEqual([]);
  });

  it('rejects past, full and unknown slots', () => {
    const base = { userId: 'val', percent: null, rid: 'RSV-9', bookingId: 10 } as const;
    expect(reserve(seed(), { ...base, spaceId: 'b204', day: 0, hour: 9 })).toEqual({
      ok: false,
      error: 'past',
    });
    expect(reserve(seed(), { ...base, spaceId: 'nope', day: 1, hour: 9 })).toEqual({
      ok: false,
      error: 'unknown-space',
    });
  });

  it('requires a percentage that fits when joining a shared slot', () => {
    // Valentina libera 50% en una franja libre y Laura intenta tomarla.
    const slot = freeSlot();
    let bookings = (
      reserve(seed(), { ...slot, userId: 'val', percent: null, rid: 'RSV-1', bookingId: 10 }) as {
        bookings: Booking[];
      }
    ).bookings;
    const bookingId = bookings.find((b) => b.rid === 'RSV-1')!.id;
    bookings = (releasePart(bookings, bookingId, 'val', 50) as { bookings: Booking[] }).bookings;

    const join = (percent: 25 | 50 | 75 | null) =>
      reserve(bookings, { ...slot, userId: 'lau', percent, rid: 'RSV-2', bookingId: 11 });

    expect(join(null)).toEqual({ ok: false, error: 'needs-percent' });
    expect(join(75)).toEqual({ ok: false, error: 'percent-too-large' });
    const ok = join(50);
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(occupancy(ok.bookings, slot.spaceId, slot.day, slot.hour)).toBe(100);
    expect(slotState(ok.bookings, slot.spaceId, slot.day, slot.hour, null).kind).toBe('full');
  });

  it('does not let someone join a slot they already hold', () => {
    const result = reserve(seed(), {
      spaceId: 'b204',
      day: 0,
      hour: 14,
      userId: 'val',
      percent: 25,
      rid: 'RSV-9',
      bookingId: 10,
    });
    expect(result).toEqual({ ok: false, error: 'already-in' });
  });

  it('creates an anonymous owner when joining a slot partially occupied by others', () => {
    // Busca una franja con ocupación de base entre 25 y 75.
    let found: { spaceId: string; day: number; hour: number; available: number } | null = null;
    for (let hour = 7; hour <= 19 && !found; hour += 1) {
      const s = slotState([], 'b310', 2, hour);
      if (s.kind === 'shared') found = { spaceId: 'b310', day: 2, hour, available: s.available };
    }
    expect(found).not.toBeNull();
    const { available, ...slot } = found!;
    const result = reserve([], { ...slot, userId: 'lau', percent: 25, rid: 'RSV-7', bookingId: 5 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.booking).toMatchObject({
      owner: 'anon',
      rid: null,
      released: available,
      ownerDone: true,
    });
    expect(result.booking.members).toHaveLength(1);
  });
});

describe('releasePart', () => {
  it('lets the owner release once, and only the owner', () => {
    const slot = freeSlot();
    const created = reserve(seed(), {
      ...slot,
      userId: 'val',
      percent: null,
      rid: 'RSV-1',
      bookingId: 10,
    });
    if (!created.ok) throw new Error('setup');
    const id = created.booking.id;
    expect(releasePart(created.bookings, id, 'lau', 25)).toEqual({ ok: false, error: 'not-owner' });
    const released = releasePart(created.bookings, id, 'val', 75);
    expect(released.ok && released.booking.released).toBe(75);
    if (!released.ok) return;
    expect(occupancy(released.bookings, slot.spaceId, slot.day, slot.hour)).toBe(25);
    expect(releasePart(released.bookings, id, 'val', 25)).toEqual({
      ok: false,
      error: 'already-released',
    });
    expect(releasePart(released.bookings, 999, 'val', 25)).toEqual({
      ok: false,
      error: 'not-found',
    });
  });

  it('offers release only to owners who have not released yet', () => {
    const bookings = seed();
    expect(canRelease(findReservation(bookings, 'lau', 'RSV-4911')!)).toBe(true);
    expect(canRelease(findReservation(bookings, 'val', 'RSV-4821')!)).toBe(false);
    expect(canRelease(findReservation(bookings, 'val', 'RSV-4907')!)).toBe(false);
  });
});

describe('reservationsOf', () => {
  it('orders from the nearest to the farthest', () => {
    const list = reservationsOf(seed(), 'val');
    expect(list.map((r) => r.rid)).toEqual(['RSV-4821', 'RSV-4907']);
    expect(list[0]).toMatchObject({ isOwner: true, pct: 100 });
    expect(list[1]).toMatchObject({ isOwner: false, pct: 25 });
  });

  it("only returns the requested user's reservations", () => {
    expect(findReservation(seed(), 'val', 'RSV-4822')).toBeUndefined();
    expect(findReservation(seed(), 'lau', 'RSV-4822')).toBeDefined();
  });

  it('describes who shares with the user', () => {
    const [first] = reservationsOf(seed(), 'val');
    expect(sharedWith(first!.booking, 'val')).toEqual(['Laura']);
    const [, second] = reservationsOf(seed(), 'val');
    expect(sharedWith(second!.booking, 'val')).toEqual(['otro estudiante']);
  });
});

describe('cancelReservation', () => {
  it('frees the percentage when a member cancels', () => {
    const result = cancelReservation(seed(), 'lau', 'RSV-4822');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(occupancy(result.bookings, 'b204', 0, 14)).toBe(50);
    expect(result.spaceFreed).toBe(false);
    expect(slotState(result.bookings, 'b204', 0, 14, 'lau').kind).toBe('shared');
  });

  it("keeps members' parts when the owner cancels", () => {
    const result = cancelReservation(seed(), 'val', 'RSV-4821');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const booking = result.bookings.find((b) => b.id === 1)!;
    expect(booking).toMatchObject({ owner: null, rid: null, released: 100 });
    expect(booking.members).toHaveLength(1);
    expect(occupancy(result.bookings, 'b204', 0, 14)).toBe(50);
    expect(result.spaceFreed).toBe(false);
  });

  it('removes the booking when the owner cancels and nobody joined', () => {
    const result = cancelReservation(seed(), 'lau', 'RSV-4911');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bookings.some((b) => b.id === 3)).toBe(false);
    expect(result.spaceFreed).toBe(true);
  });

  it('removes the booking when the last member cancels and there is no real owner', () => {
    const result = cancelReservation(seed(), 'val', 'RSV-4907');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bookings.some((b) => b.id === 2)).toBe(false);
  });

  it('can cancel the owner after the member cancelled, leaving the slot free', () => {
    const first = cancelReservation(seed(), 'lau', 'RSV-4822');
    if (!first.ok) throw new Error('setup');
    const second = cancelReservation(first.bookings, 'val', 'RSV-4821');
    expect(second.ok && second.spaceFreed).toBe(true);
  });

  it('fails for unknown reservations', () => {
    expect(cancelReservation(seed(), 'val', 'RSV-0')).toEqual({ ok: false, error: 'not-found' });
    expect(cancelReservation(seed(), 'val', 'RSV-4822')).toEqual({ ok: false, error: 'not-found' });
  });
});

describe('check-in window', () => {
  it('opens 10 minutes before and closes 15 minutes after the start (clock is 1:55 p. m.)', () => {
    expect(checkInWindow({ day: 0, hour: 14 })).toBe('open'); // 1:50 → 2:15
    expect(checkInWindow({ day: 0, hour: 15 })).toBe('before'); // opens 2:50
    expect(checkInWindow({ day: 0, hour: 13 })).toBe('after'); // closed at 1:15
  });

  it('reservations on later days are always before the window', () => {
    expect(checkInWindow({ day: 1, hour: 7 })).toBe('before');
  });
});
