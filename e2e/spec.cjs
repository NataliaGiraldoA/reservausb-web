/**
 * Batería funcional de la especificación contra el build de un solo archivo.
 *
 * Uso (requiere Playwright, que no es dependencia del proyecto):
 *   npm run build:single
 *   npm i --no-save playwright && npx playwright install chromium
 *   node e2e/spec.cjs dist-single/index.html
 */
// Batería funcional de la especificación contra el build (dist-single/index.html por file://).
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(process.argv[2]);
let pass = 0, fail = 0; const errors = [];
function ok(name, cond, extra) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? '  -> ' + extra : '')); } }
const nb = (s) => s.replace(/ /g, ' ');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  p.on('console', m => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  const go = async h => { await p.goto(FILE + h); await p.waitForTimeout(250); };
  const txt = async s => nb(await p.locator(s).first().innerText());
  const body = async () => nb(await p.locator('body').innerText());
  const hash = async () => p.evaluate(() => location.hash);
  const login = async (em, pw) => { await p.fill('#email', em); await p.fill('#password', pw); await p.click('button[type=submit]'); await p.waitForTimeout(150); };
  const quick = async who => { await go('#/ingresar'); await p.click(`button:has-text("Entrar como ${who}")`); await p.waitForTimeout(200); };
  const logout = async () => { await go('#/perfil'); await p.click('button:has-text("Cerrar sesión")'); await p.waitForTimeout(150); };
  const slot = h => p.locator('.slotrow', { hasText: new RegExp('^' + (h > 12 ? h - 12 : h) + ':00\\s' + (h >= 12 ? 'p' : 'a') + '\\.') });
  const pct = n => p.locator('.pct', { hasText: new RegExp('^' + n + '%') });
  const card = rid => p.locator('article.resv', { hasText: rid });
  const btn = t => p.getByRole('button', { name: t });
  await p.goto(FILE + '#/'); await p.waitForTimeout(500);

  console.log('P1 Inicio de sesión');
  await go('#/ingresar');
  await login('foo@gmail.com', 'x');
  ok('correo ajeno al dominio muestra error que explica el problema', /usbcali\.edu\.co/.test(await txt('.alert')));
  ok('conserva el correo escrito', (await p.inputValue('#email')) === 'foo@gmail.com');
  await login('nadie@correo.usbcali.edu.co', 'usb2026');
  ok('cuenta inexistente', /No encontramos/.test(await txt('.alert')));
  await login('valentina.rios@correo.usbcali.edu.co', '');
  ok('contraseña vacía', /Escribe tu contraseña/.test(await txt('.alert')));
  await login('valentina.rios@correo.usbcali.edu.co', 'mala');
  ok('contraseña incorrecta', /no coincide/.test(await txt('.alert')));
  await login('valentina.rios@correo.usbcali.edu.co', 'usb2026');
  ok('acceso correcto lleva a Explorar', (await hash()) === '#/explorar', await hash());

  console.log('P2 Explorar');
  ok('7 espacios', (await p.locator('.dirrow').count()) === 7);
  const counts = {};
  for (const [k, label] of [['sala', 'Salas de estudio'], ['cancha', 'Canchas'], ['lab', 'Laboratorios'], ['todos', 'Todos']]) { await p.locator('.tab', { hasText: label }).click(); await p.waitForTimeout(120); counts[k] = await p.locator('.dirrow').count(); }
  ok('filtros por tipo: salas 3, canchas 2, laboratorios 2, todos 7', counts.sala === 3 && counts.cancha === 2 && counts.lab === 2 && counts.todos === 7, JSON.stringify(counts));
  const row = await txt('.dirrow');
  ok('cada espacio muestra capacidad, ubicación, % de ocupación y franjas con cupo', /8 personas/.test(row) && /Bloque B/.test(row) && /\d+%/.test(row) && /franjas? con cupo hoy/.test(row), row.replace(/\n/g, ' | '));

  console.log('P3 Franjas y reserva');
  await go('#/espacio/b204');
  ok('franja compartida de B-204 (2:00 p. m.) aparece como Tu reserva y deshabilitada', await slot(14).isDisabled() && /Tu reserva/.test(nb(await slot(14).innerText())));
  ok('las franjas que ya pasaron no se pueden seleccionar', (await slot(7).count()) === 0 && /ya pasaron/.test(await body()));
  ok('hay franjas hasta las 7:00 p. m. (termina 8:00 p. m.)', (await slot(19).count()) === 1);
  ok('hoy y 6 días siguientes', (await p.locator('.day').count()) === 7);
  await go('#/espacio/b310');
  await slot(15).click();
  ok('franja libre: no pide porcentaje y reserva espacio completo', (await p.locator('.pct').count()) === 0 && /Reservar el espacio completo/.test(await txt('.book .btn')));
  await p.click('.book .btn');
  const sum = await txt('.dialog');
  ok('resumen antes de confirmar: espacio, fecha, hora y parte', /Revisa tu reserva/.test(sum) && /Sala de estudio B-310/.test(sum) && /lunes 28 de septiembre/.test(sum) && /3:00 a 4:00/.test(sum) && /Espacio completo/.test(sum));
  ok('primera reserva no muestra "Compartes con"', !/Compartes con/.test(sum));
  await btn('Cambiar').click();
  ok('"Cambiar" cierra el resumen sin reservar', (await p.locator('.dialog').count()) === 0 && (await hash()) === '#/espacio/b310');
  await p.click('.book .btn'); await btn('Confirmar reserva').click(); await p.waitForTimeout(200);
  const h1 = await hash();
  ok('confirmar lleva al comprobante con código', /#\/comprobante\/RSV-\d+/.test(h1), h1);
  const val310 = h1.split('/').pop();

  console.log('P4 Comprobante');
  ok('comprobante muestra código y detalle', /RSV-\d+/.test(await txt('.ticket__code')) && /Sala de estudio B-310/.test(await txt('.ticket')));
  ok('reserva completa ofrece "Liberar una parte"', (await p.locator('a:has-text("Liberar una parte")').count()) === 1);

  console.log('P5 Liberar parte');
  await p.click('a:has-text("Liberar una parte")'); await p.waitForTimeout(150);
  ok('botón deshabilitado hasta elegir porcentaje', await btn('Elige qué parte liberar').isDisabled());
  ok('opciones 25, 50 y 75', (await p.locator('.seg button').count()) === 3);
  await p.locator('.seg button', { hasText: /^50%/ }).click(); await btn('Liberar 50% del espacio').click(); await p.waitForTimeout(150);
  ok('queda liberado 50%', /Liberaste el 50%/.test(await body()));
  await go('#/comprobante/' + val310);
  ok('tras liberar ya no ofrece liberar de nuevo', (await p.locator('a:has-text("Liberar una parte")').count()) === 0);

  console.log('P3 (parte liberada) como segundo estudiante');
  await logout(); await quick('Laura');
  await go('#/espacio/b310');
  ok('franja liberada se ve "50% liberado"', /50% liberado/.test(await slot(15).innerText()));
  await slot(15).click();
  ok('solo se puede tomar dentro de lo liberado: 25 y 50 habilitados, 75 deshabilitado', !(await pct(25).isDisabled()) && !(await pct(50).isDisabled()) && await pct(75).isDisabled());
  ok('no se puede confirmar sin elegir porcentaje', await btn('Elige qué parte tomar').isDisabled());
  await pct(50).click(); await p.click('.book .btn');
  ok('resumen indica con quién se comparte', /Compartes con\s*Valentina/.test((await txt('.dialog')).replace(/\n/g, '')), await txt('.dialog'));
  await btn('Confirmar reserva').click(); await p.waitForTimeout(200);
  const lau310 = (await hash()).split('/').pop();
  ok('Laura recibe comprobante de parte tomada, sin opción de liberar', /Tomaste una parte/.test(await body()) && (await p.locator('a:has-text("Liberar una parte")').count()) === 0);
  ok('la franja ahora está llena (50% + 50%)', await (async () => { await go('#/espacio/b310'); return /Tu reserva/.test(await slot(15).innerText()); })());

  console.log('P7 Mis reservas (Laura)');
  await go('#/mis-reservas');
  const titles = await p.locator('.resv h2').allInnerTexts();
  ok('ordenadas de la más próxima a la más lejana', JSON.stringify(titles) === JSON.stringify(['Sala de estudio B-204', 'Sala de estudio B-310', 'Laboratorio de Sistemas']), JSON.stringify(titles));
  const mine = await body();
  ok('indica si reservó primero o tomó una parte, y con quién comparte', /Reservó primero Valentina/.test(mine) && /Reservaste el espacio completo/.test(mine));
  ok('check-in solo en la reserva dentro de la ventana (B-204 2:00 p. m.)', (await p.locator('a:has-text("Hacer check-in")').count()) === 1);

  console.log('P7 Cancelar');
  await logout(); await quick('Valentina'); await go('#/mis-reservas');
  await card(val310).getByRole('button', { name: 'Cancelar' }).click();
  ok('cancelar pide confirmación', /¿Cancelar esta reserva\?/.test(await txt('.dialog')));
  await btn('Mantener reserva').click();
  ok('mantener conserva la reserva', (await card(val310).count()) === 1);
  await card(val310).getByRole('button', { name: 'Cancelar' }).click(); await btn('Sí, cancelar reserva').click(); await p.waitForTimeout(150);
  ok('quien reservó primero cancela: desaparece de su lista', (await card(val310).count()) === 0);
  ok('aviso de cancelación', /Reserva cancelada/.test(await body()));
  await go('#/espacio/b310');
  ok('su parte queda libre (hay 50% liberado, no llena)', /50% liberado/.test(await slot(15).innerText()) || /Tu reserva/.test(await slot(15).innerText()) === false);
  await logout(); await quick('Laura'); await go('#/mis-reservas');
  ok('quien tomó una parte la conserva', (await card(lau310).count()) === 1);
  await card(lau310).getByRole('button', { name: 'Cancelar' }).click(); await btn('Sí, cancelar reserva').click(); await p.waitForTimeout(150);
  await go('#/espacio/b310');
  ok('cuando cancela quien tomó una parte, el espacio vuelve a estar libre', /Libre/.test(await slot(15).innerText()));

  console.log('P8 Check-in y bonificación');
  await go('#/check-in/RSV-4822');
  ok('ventana abierta: de 1:50 p. m. a 2:15 p. m.', /1:50 p\. m\. a 2:15 p\. m\./.test(await txt('.win')) && !(await btn('Escanear código QR').isDisabled()));
  await btn('Escanear código QR').click(); await p.waitForTimeout(1900);
  ok('check-in de Laura: bonificación pendiente hasta que Valentina haga check-in', /Bonificación pendiente/.test(await body()) && /Valentina/.test(await body()));
  await go('#/perfil');
  ok('Laura aún sin puntos', /0 puntos/.test(await txt('.panel--night .bignum')));
  await logout(); await quick('Valentina');
  await go('#/check-in/RSV-4821'); await btn('Escanear código QR').click(); await p.waitForTimeout(1900);
  ok('Valentina recibe 20 puntos al completar el compartido', /\+20 puntos/.test(await body()), (await body()).slice(0, 400));
  await go('#/perfil');
  ok('puntos de Valentina: 30 + 20 = 50', /^50 puntos/.test(await txt('.panel--night .bignum')), await txt('.panel--night .bignum'));
  ok('horas de uso suman 1 por check-in (12 → 13)', /13 h/.test(await txt('.metrics')), await txt('.metrics'));
  ok('historial incluye la bonificación nueva', /\+20/.test(await body()));
  await go('#/check-in/RSV-4907');
  ok('fuera de la ventana: check-in deshabilitado y explicado', await btn('Escanear código QR').isDisabled() && /se habilita 10 minutos antes/.test(await txt('.win')));
  await logout(); await quick('Laura'); await go('#/perfil');
  ok('Laura recibe 5 puntos', /^5 puntos/.test(await txt('.panel--night .bignum')), await txt('.panel--night .bignum'));

  console.log('P6 Perfil y promedio');
  await go('#/top');
  ok('sin promedio no aparece en el top y ve un aviso', /Aún no estás en el top/.test(await body()) && !(/Laura Mejía/.test(await txt('.rank'))));
  await go('#/perfil');
  await p.fill('#grade', '6'); await btn('Guardar').click(); await p.waitForTimeout(100);
  ok('promedio fuera de rango muestra error y no se guarda', /entre 0,0 y 5,0/.test(await txt('.alert')) && /Sin dato/.test(await txt('.metrics')));
  await p.fill('#grade', '4,5'); await btn('Guardar').click(); await p.waitForTimeout(100);
  ok('promedio válido se guarda', /4,5/.test(await txt('.metrics')));
  ok('acceso al top, reportar y cerrar sesión', (await p.locator('.menu a[href="#/top"]').count()) === 1 && (await p.locator('.menu a[href="#/reportar"]').count()) === 1 && (await p.locator('.menu button:has-text("Cerrar sesión")').count()) === 1);

  console.log('P10 Top');
  await go('#/top');
  const rankNames = await p.locator('.rank li').count();
  ok('muestra los 10 primeros como máximo', rankNames <= 10 && rankNames >= 9, String(rankNames));
  await logout(); await quick('Valentina'); await go('#/top');
  const panel = await txt('.panel--night');
  ok('índice de Valentina = 25,0 + 29,4 + 20,7 = 75,1 (ejemplo de la especificación)', /75,1/.test(panel) && /\+25,0/.test(panel) && /\+29,4/.test(panel) && /\+20,7/.test(panel), panel.replace(/\n/g, ' | '));
  ok('desglose por métrica con su peso', /Puntos \(30%\)/.test(panel) && /Promedio \(35%\)/.test(panel) && /Horas de uso \(35%\)/.test(panel));
  const rk = await txt('.rank');
  ok('de los demás solo se ve nombre e índice', !/promedio|horas|puntos/i.test(rk), rk.slice(0, 200));

  console.log('P9 Reportar daño');
  await go('#/reportar');
  ok('enviar deshabilitado sin categoría ni descripción', await btn('Enviar reporte').isDisabled());
  ok('hay 5 categorías', (await p.locator('.chip').count()) === 5);
  await p.locator('.chip', { hasText: 'Mobiliario' }).click(); await p.fill('#report-description', 'corto');
  ok('con menos de 10 caracteres sigue deshabilitado', await btn('Enviar reporte').isDisabled());
  await p.fill('#report-description', 'La silla del fondo está rota.');
  ok('con categoría y 10+ caracteres se habilita', !(await btn('Enviar reporte').isDisabled()));
  await btn('Enviar reporte').click(); await p.waitForTimeout(150);
  ok('muestra número de seguimiento', /REP-\d+/.test(await txt('.ticket__code')));

  console.log('Alcance (sin funciones fuera de la especificación)');
  await go('#/admin');
  ok('no existe vista de administración', (await hash()) === '#/' || (await hash()) === '#/explorar', await hash());
  const all = await body();
  ok('sin referencias a administración ni planta física', !/administraci[oó]n|planta f[ií]sica/i.test(all));
  await go('#/explorar');
  ok('sin buscador', (await p.locator('input[type=search]').count()) === 0);
  await logout(); await go('#/explorar');
  ok('sin sesión, las pantallas internas redirigen al inicio de sesión', (await hash()) === '#/ingresar', await hash());
  await quick('Valentina');
  ok('al iniciar sesión se retoma la ruta pedida', (await hash()) === '#/explorar');
  await logout();
  ok('cerrar sesión vuelve a la portada', (await hash()) === '#/', await hash());

  await p.setViewportSize({ width: 390, height: 844 }); await quick('Valentina');
  ok('navegación inferior: Explorar, Mis reservas, Top y Perfil', JSON.stringify((await p.locator('.tabbar a').allInnerTexts()).map(s => s.replace(/\d+/g, '').trim())) === JSON.stringify(['Explorar', 'Mis reservas', 'Top', 'Perfil']), JSON.stringify(await p.locator('.tabbar a').allInnerTexts()));

  console.log(`\n${pass} correctas, ${fail} fallidas. Errores de consola: ${errors.length ? errors.join(' || ') : 'ninguno'}`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
