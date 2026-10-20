import { DEMO_PASSWORD, MAX_GRADE, MIN_REPORT_DESCRIPTION_LENGTH, USERS } from './constants';
import type { ReportCategory, User } from './types';

const INSTITUTIONAL_EMAIL = /^[^@\s]+@([a-z0-9-]+\.)*usbcali\.edu\.co$/i;

export function isInstitutionalEmail(email: string): boolean {
  return INSTITUTIONAL_EMAIL.test(email.trim());
}

export type LoginField = 'email' | 'password';

export type LoginResult =
  | { readonly ok: true; readonly user: User }
  | { readonly ok: false; readonly field: LoginField; readonly message: string };

/** Valida el inicio de sesión con errores distintos para cada caso. */
export function validateLogin(rawEmail: string, password: string): LoginResult {
  const email = rawEmail.trim();
  if (!isInstitutionalEmail(email)) {
    return {
      ok: false,
      field: 'email',
      message: 'Usa tu correo institucional. Debe terminar en usbcali.edu.co.',
    };
  }
  const user = Object.values(USERS).find((u) => u.email === email.toLowerCase());
  if (!user) {
    return { ok: false, field: 'email', message: 'No encontramos una cuenta con este correo.' };
  }
  if (!password) {
    return { ok: false, field: 'password', message: 'Escribe tu contraseña para continuar.' };
  }
  if (password !== DEMO_PASSWORD) {
    return {
      ok: false,
      field: 'password',
      message: 'La contraseña no coincide con este correo. Revísala e inténtalo de nuevo.',
    };
  }
  return { ok: true, user };
}

export type GradeResult =
  { readonly ok: true; readonly value: number } | { readonly ok: false; readonly message: string };

export const GRADE_ERROR = 'Escribe un promedio entre 0,0 y 5,0, por ejemplo 4,2.';

/** Acepta coma o punto decimal, de 0 a 5, y lo guarda con un decimal. */
export function parseGrade(raw: string): GradeResult {
  const text = raw.trim().replace(',', '.');
  if (!/^\d(\.\d{1,2})?$/.test(text)) return { ok: false, message: GRADE_ERROR };
  const value = Number.parseFloat(text);
  if (Number.isNaN(value) || value < 0 || value > MAX_GRADE)
    return { ok: false, message: GRADE_ERROR };
  return { ok: true, value: Math.round(value * 10) / 10 };
}

/** El reporte se puede enviar con categoría y una descripción de al menos 10 caracteres. */
export function isReportReady(
  category: ReportCategory | '',
  description: string,
): category is ReportCategory {
  return category !== '' && description.trim().length >= MIN_REPORT_DESCRIPTION_LENGTH;
}
