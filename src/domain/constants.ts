import type {
  ReportCategory,
  SharePercent,
  Space,
  SpaceType,
  Student,
  User,
  UserId,
} from './types';

export const SPACES: readonly Space[] = [
  {
    id: 'b204',
    code: 'B-204',
    name: 'Sala de estudio B-204',
    type: 'sala',
    where: 'Bloque B, piso 2',
    capacity: 8,
  },
  {
    id: 'b310',
    code: 'B-310',
    name: 'Sala de estudio B-310',
    type: 'sala',
    where: 'Bloque B, piso 3',
    capacity: 4,
  },
  {
    id: 'bib1',
    code: 'BG-1',
    name: 'Sala grupal Biblioteca',
    type: 'sala',
    where: 'Biblioteca, piso 1',
    capacity: 12,
  },
  {
    id: 'can1',
    code: 'CM',
    name: 'Cancha múltiple',
    type: 'cancha',
    where: 'Coliseo',
    capacity: 16,
  },
  {
    id: 'ten1',
    code: 'CT',
    name: 'Cancha de tenis',
    type: 'cancha',
    where: 'Zona deportiva',
    capacity: 4,
  },
  {
    id: 'l101',
    code: 'L-101',
    name: 'Laboratorio de Sistemas',
    type: 'lab',
    where: 'Bloque L, piso 1',
    capacity: 24,
  },
  {
    id: 'l204',
    code: 'L-204',
    name: 'Laboratorio de Electrónica',
    type: 'lab',
    where: 'Bloque L, piso 2',
    capacity: 20,
  },
];

export type SpaceFilter = 'todos' | SpaceType;

export const SPACE_FILTERS: readonly SpaceFilter[] = ['todos', 'sala', 'cancha', 'lab'];

export const SPACE_FILTER_LABELS: Record<SpaceFilter, string> = {
  todos: 'Todos',
  sala: 'Salas de estudio',
  cancha: 'Canchas',
  lab: 'Laboratorios',
};

/** Franjas de una hora: de 7:00 a. m. a 8:00 p. m. (la última empieza a las 7:00 p. m.). */
export const HOURS: readonly number[] = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export interface DayInfo {
  /** Abreviatura del día de la semana. */
  readonly short: string;
  /** Día del mes. */
  readonly date: number;
  readonly label: string;
}

/** Hoy y los 6 días siguientes. */
export const DAYS: readonly DayInfo[] = [
  { short: 'lun', date: 28, label: 'Hoy, lunes 28 de septiembre' },
  { short: 'mar', date: 29, label: 'Martes 29 de septiembre' },
  { short: 'mié', date: 30, label: 'Miércoles 30 de septiembre' },
  { short: 'jue', date: 1, label: 'Jueves 1 de octubre' },
  { short: 'vie', date: 2, label: 'Viernes 2 de octubre' },
  { short: 'sáb', date: 3, label: 'Sábado 3 de octubre' },
  { short: 'dom', date: 4, label: 'Domingo 4 de octubre' },
];

/** La hora de la app está simulada: lunes 28 de septiembre, 1:55 p. m. */
export const NOW = { day: 0, hour: 13, minute: 55 } as const;

/** Fecha corta que se guarda en el historial de puntos. */
export const TODAY_SHORT = '28 sep';

/** El check-in se permite desde 10 minutos antes hasta 15 minutos después del inicio. */
export const CHECK_IN_MINUTES_BEFORE = 10;
export const CHECK_IN_MINUTES_AFTER = 15;

export const SHARE_PERCENTS: readonly SharePercent[] = [25, 50, 75];

/** Bonificación al usarse un espacio compartido. */
export const POINTS_OWNER = 20;
export const POINTS_JOINER = 5;

/** Pesos del índice del top (suman 1). */
export const INDEX_WEIGHTS = { points: 0.3, grade: 0.35, hours: 0.35 } as const;

export const MAX_GRADE = 5;

export const REPORT_CATEGORIES: readonly ReportCategory[] = [
  'Mobiliario',
  'Eléctrico',
  'Tecnología',
  'Limpieza',
  'Otro',
];
export const MIN_REPORT_DESCRIPTION_LENGTH = 10;

export const EMAIL_DOMAIN = 'usbcali.edu.co';

/** Contraseña de las cuentas de demostración. */
export const DEMO_PASSWORD = 'usb2026';

export const USERS: Record<UserId, User> = {
  val: {
    id: 'val',
    name: 'Valentina Ríos',
    firstName: 'Valentina',
    email: 'valentina.rios@correo.usbcali.edu.co',
  },
  lau: {
    id: 'lau',
    name: 'Laura Mejía',
    firstName: 'Laura',
    email: 'laura.mejia@correo.usbcali.edu.co',
  },
};

/** Estudiantes ficticios que completan el top. */
export const OTHER_STUDENTS: readonly Student[] = [
  { name: 'Santiago Mora', points: 45, grade: 4.0, hours: 18, userId: null },
  { name: 'Camila Rojas', points: 25, grade: 4.6, hours: 10, userId: null },
  { name: 'Andrés Ocampo', points: 60, grade: 3.6, hours: 22, userId: null },
  { name: 'Mariana Lozano', points: 15, grade: 4.8, hours: 8, userId: null },
  { name: 'Juan Esteban Ruiz', points: 35, grade: 3.9, hours: 14, userId: null },
  { name: 'Sofía Cárdenas', points: 10, grade: 4.3, hours: 20, userId: null },
  { name: 'Daniel Herrera', points: 50, grade: 3.4, hours: 9, userId: null },
  { name: 'Isabella Torres', points: 20, grade: 4.1, hours: 16, userId: null },
];

/**
 * Ocupación de base de las franjas sin reservas propias de la sesión: simula que otros
 * estudiantes ya reservaron y liberaron parte del espacio.
 */
export const BASE_OCCUPANCY: readonly number[] = [
  0, 50, 100, 25, 0, 75, 100, 0, 50, 0, 25, 0, 100, 50,
];
