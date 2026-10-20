import {
  baseOccupancy,
  highlightHour,
  isPast,
  occupancy,
  peopleFor,
  selectablePercents,
  slotState,
  slotsWithRoom,
} from './availability';
import { SPACES } from './constants';
import { createSeed } from './seed';

const seed = createSeed();

describe('availability', () => {
  it('marks today up to the current hour as past', () => {
    expect(isPast(0, 13)).toBe(true);
    expect(isPast(0, 14)).toBe(false);
    expect(isPast(1, 7)).toBe(false);
  });

  it('computes people for a percentage, at least one', () => {
    const b310 = SPACES.find((s) => s.id === 'b310')!;
    expect(peopleFor(b310, 25)).toBe(1);
    expect(peopleFor(b310, 50)).toBe(2);
    const lab = SPACES.find((s) => s.id === 'l101')!;
    expect(peopleFor(lab, 75)).toBe(18);
  });

  it('base occupancy is deterministic and one of the allowed values', () => {
    for (const space of SPACES) {
      for (let day = 0; day < 7; day += 1) {
        for (let hour = 7; hour <= 19; hour += 1) {
          const value = baseOccupancy(space.id, day, hour);
          expect([0, 25, 50, 75, 100]).toContain(value);
          expect(baseOccupancy(space.id, day, hour)).toBe(value);
        }
      }
    }
  });

  it('shows the seeded B-204 slot at 2 p. m. as full: Valentina released 50% and Laura took it', () => {
    expect(occupancy(seed.bookings, 'b204', 0, 14)).toBe(100);
    const state = slotState(seed.bookings, 'b204', 0, 14, null);
    expect(state).toMatchObject({ kind: 'full', occupied: 100, available: 0 });
  });

  it('shows the seeded slot as "mine" for its participants', () => {
    expect(slotState(seed.bookings, 'b204', 0, 14, 'val').kind).toBe('mine');
    expect(slotState(seed.bookings, 'b204', 0, 14, 'lau').kind).toBe('mine');
  });

  it('past slots are never selectable', () => {
    expect(slotState([], 'b204', 0, 9, 'val').kind).toBe('past');
  });

  it('only offers percentages that fit in what was released', () => {
    expect(selectablePercents(25)).toEqual([25]);
    expect(selectablePercents(50)).toEqual([25, 50]);
    expect(selectablePercents(100)).toEqual([25, 50, 75]);
    expect(selectablePercents(0)).toEqual([]);
  });

  it('counts slots with room only in the future', () => {
    const today = slotsWithRoom([], 'l101', 0);
    const tomorrow = slotsWithRoom([], 'l101', 1);
    expect(today).toBeLessThanOrEqual(6);
    expect(tomorrow).toBeLessThanOrEqual(13);
  });

  it('highlight hour is always a future hour', () => {
    for (const space of SPACES) expect(highlightHour([], space.id)).toBeGreaterThan(13);
  });
});
