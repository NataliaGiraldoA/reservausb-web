import { isReportReady, parseGrade, validateLogin } from './validators';

describe('validateLogin', () => {
  const email = 'valentina.rios@correo.usbcali.edu.co';

  it('accepts a demo account', () => {
    const result = validateLogin(email, 'usb2026');
    expect(result.ok && result.user.id).toBe('val');
  });

  it('is case-insensitive on the email and trims it', () => {
    expect(validateLogin(`  ${email.toUpperCase()} `, 'usb2026').ok).toBe(true);
  });

  it('rejects non-institutional emails explaining the domain', () => {
    expect(validateLogin('valentina@gmail.com', 'usb2026')).toEqual({
      ok: false,
      field: 'email',
      message: 'Usa tu correo institucional. Debe terminar en usbcali.edu.co.',
    });
    expect(validateLogin('', 'x')).toMatchObject({ field: 'email' });
    expect(validateLogin('a@usbcali.edu.co.evil.com', 'x')).toMatchObject({ field: 'email' });
  });

  it('reports a non-existent institutional account', () => {
    expect(validateLogin('otra@correo.usbcali.edu.co', 'usb2026')).toEqual({
      ok: false,
      field: 'email',
      message: 'No encontramos una cuenta con este correo.',
    });
  });

  it('reports an empty password and a wrong password differently', () => {
    const empty = validateLogin(email, '');
    const wrong = validateLogin(email, 'nope');
    expect(empty).toMatchObject({
      ok: false,
      field: 'password',
      message: 'Escribe tu contraseña para continuar.',
    });
    expect(wrong).toMatchObject({ ok: false, field: 'password' });
    expect(!empty.ok && !wrong.ok && empty.message !== wrong.message).toBe(true);
  });
});

describe('parseGrade', () => {
  it.each([
    ['4,2', 4.2],
    ['4.2', 4.2],
    ['0', 0],
    ['5', 5],
    ['5,0', 5],
    ['3,75', 3.8],
    [' 3 ', 3],
  ])('accepts %s', (raw, value) => {
    expect(parseGrade(raw)).toEqual({ ok: true, value });
  });

  it.each(['', 'abc', '5,1', '6', '-1', '4,', '4,567', '1e1', '4..2'])('rejects %s', (raw) => {
    expect(parseGrade(raw)).toMatchObject({ ok: false });
  });
});

describe('isReportReady', () => {
  it('needs a category and at least 10 characters', () => {
    expect(isReportReady('', 'La silla está rota')).toBe(false);
    expect(isReportReady('Mobiliario', 'corta')).toBe(false);
    expect(isReportReady('Mobiliario', '          x         ')).toBe(false);
    expect(isReportReady('Mobiliario', 'La silla está rota')).toBe(true);
    expect(isReportReady('Otro', '1234567890')).toBe(true);
  });
});
