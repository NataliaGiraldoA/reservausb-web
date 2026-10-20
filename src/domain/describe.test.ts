import { SPACES } from './constants';
import {
  cancelDescription,
  checkInWindowText,
  dayLabel,
  describeHour,
  participationText,
} from './describe';
import { formatRange } from './format';
import { findReservation } from './reservations';
import { createSeed } from './seed';
import type { Booking } from './types';

const bookings = createSeed().bookings as Booking[];
const b204 = SPACES[0]!;

describe('describe', () => {
  it('labels days', () => {
    expect(dayLabel(0)).toBe('Hoy');
    expect(dayLabel(2)).toBe('Miércoles 30 de septiembre');
  });

  it('describes hours', () => {
    expect(describeHour(b204, 0, 9, 0)).toBe('ya pasó');
    expect(describeHour(b204, 1, 9, 0)).toBe('libre, cupo para 8 personas');
    expect(describeHour(b204, 1, 9, 100)).toBe('llena');
    expect(describeHour(b204, 1, 9, 50)).toBe('50% ocupado, cupo para 4 de 8 personas');
  });

  it('explains the check-in window', () => {
    expect(checkInWindowText({ day: 0, hour: 14 })).toMatch(
      /^Check-in disponible de 1:50\sp\.\sm\. a 2:15\sp\.\sm\./,
    );
    expect(checkInWindowText({ day: 1, hour: 10 })).toContain('se habilita 10 minutos antes');
    expect(checkInWindowText({ day: 1, hour: 10 })).toContain('martes 29 de septiembre');
    expect(checkInWindowText({ day: 0, hour: 9 })).toContain('terminó 15 minutos después');
  });

  it('describes participation for the owner and the joiner', () => {
    const owner = findReservation(bookings, 'val', 'RSV-4821')!;
    expect(participationText(owner, b204)).toBe(
      'Reservaste el espacio completo, liberaste 50% y lo tomó Laura (50%).',
    );
    const joiner = findReservation(bookings, 'lau', 'RSV-4822')!;
    expect(participationText(joiner, b204)).toBe(
      'Tu parte: 50% (4 personas). Reservó primero Valentina.',
    );
    const alone = findReservation(bookings, 'lau', 'RSV-4911')!;
    expect(participationText(alone, SPACES[5]!)).toBe('Reservaste el espacio completo.');
  });

  it('describes what cancelling does', () => {
    const owner = findReservation(bookings, 'val', 'RSV-4821')!;
    expect(cancelDescription(owner, b204, formatRange(14))).toContain('conservan la suya');
    const joiner = findReservation(bookings, 'lau', 'RSV-4822')!;
    expect(cancelDescription(joiner, b204, formatRange(14))).toContain('Tu 50% volverá');
    const alone = findReservation(bookings, 'lau', 'RSV-4911')!;
    expect(cancelDescription(alone, SPACES[5]!, formatRange(10))).toContain(
      'quedará libre para otros',
    );
  });
});
