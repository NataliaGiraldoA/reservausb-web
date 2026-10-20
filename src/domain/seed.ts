import type { Booking, DamageReport, PointEntry, UserId } from './types';

/** Estado de partida de la demostración. */
export interface SeedState {
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

/**
 * - B-204 hoy a las 2:00 p. m. ya está compartida: Valentina reservó completo, liberó 50% y Laura lo tomó.
 * - La cancha múltiple, en dos días, la reservó otro estudiante; Valentina tomó 25%.
 * - Laura reservó el Laboratorio de Sistemas mañana.
 */
export function createSeed(): SeedState {
  return {
    bookings: [
      {
        id: 1,
        spaceId: 'b204',
        day: 0,
        hour: 14,
        owner: 'val',
        rid: 'RSV-4821',
        released: 50,
        ownerDone: false,
        awarded: false,
        members: [{ uid: 'lau', pct: 50, rid: 'RSV-4822', done: false }],
      },
      {
        id: 2,
        spaceId: 'can1',
        day: 2,
        hour: 17,
        owner: 'anon',
        rid: null,
        released: 75,
        ownerDone: true,
        awarded: false,
        members: [{ uid: 'val', pct: 25, rid: 'RSV-4907', done: false }],
      },
      {
        id: 3,
        spaceId: 'l101',
        day: 1,
        hour: 10,
        owner: 'lau',
        rid: 'RSV-4911',
        released: 0,
        ownerDone: false,
        awarded: false,
        members: [],
      },
    ],
    points: {
      val: [
        {
          text: 'Liberaste 50% de Sala de estudio B-310 y se usó en compartido',
          date: '22 sep',
          points: 20,
        },
        {
          text: 'Tomaste una parte de Cancha múltiple y se usó en compartido',
          date: '24 sep',
          points: 5,
        },
        {
          text: 'Tomaste una parte de Laboratorio de Sistemas y se usó en compartido',
          date: '25 sep',
          points: 5,
        },
      ],
      lau: [],
    },
    grades: { val: 4.2, lau: null },
    hours: { val: 12, lau: 6 },
    reports: [],
    counters: { reservation: 4912, booking: 4, report: 1041 },
  };
}
