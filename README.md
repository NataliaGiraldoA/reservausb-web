# ReservaUSB

Sitio web para reservar y compartir las salas de estudio, canchas y laboratorios del campus de la
Universidad de San Buenaventura Cali. Es la versión de escritorio y móvil del prototipo navegable,
construida con **React 19 + TypeScript + Vite**.

Solo para estudiantes (no hay rol de administrador). Los datos son de demostración y viven en
memoria: se reinician al recargar la página.

## Cómo ejecutarlo

Requiere Node.js 20.19 o superior (o 22.12+).

```bash
npm install
npm run dev            # servidor de desarrollo en http://localhost:5173
```

| Comando                | Qué hace                                                                     |
| ---------------------- | ---------------------------------------------------------------------------- |
| `npm run build`        | Compila a `dist/` (para publicar en cualquier hosting estático).             |
| `npm run build:single` | Genera `dist-single/index.html`: un solo archivo que se abre con doble clic. |
| `npm run preview`      | Sirve el build de `dist/` para probarlo.                                     |
| `npm test`             | Pruebas unitarias y de integración (Vitest + Testing Library).               |
| `npm run typecheck`    | Revisa los tipos de TypeScript.                                              |
| `npm run lint`         | ESLint.                                                                      |
| `npm run format`       | Prettier.                                                                    |
| `npm run e2e`          | Recorrido completo de la especificación en un navegador (ver `e2e/`).        |

El sitio abre en **tema claro**; el botón de la cabecera (luna/sol) cambia al oscuro y recuerda la
elección en el navegador.

Las rutas usan el fragmento de la URL (`#/explorar`), así que la app funciona desde cualquier
carpeta y abriéndola como archivo, sin configurar el servidor.

## Despliegue en Vercel

Ya incluye `vercel.json`. Sube la carpeta a un repositorio y impórtalo en Vercel (detecta Vite solo),
o desde la carpeta: `npx vercel --prod`. Compila con `npm run build` y publica `dist/`.
No hacen falta reglas de redirección porque las rutas viven en el fragmento (`#/…`).

## Cuentas de demostración

Contraseña de ambas: `usb2026`.

| Cuenta                                 | Promedio | Horas | Puntos |
| -------------------------------------- | -------- | ----- | ------ |
| `valentina.rios@correo.usbcali.edu.co` | 4,2      | 12    | 30     |
| `laura.mejia@correo.usbcali.edu.co`    | sin dato | 6     | 0      |

Comparten los mismos datos: puedes reservar con una, cerrar sesión y ver el efecto con la otra.
La hora simulada es **lunes 28 de septiembre, 1:55 p. m.** (B-204 a las 2:00 p. m. ya está
compartida entre Valentina y Laura, y esa reserva está dentro de la ventana de check-in).

## Pantallas

| Ruta                 | Pantalla                                   |
| -------------------- | ------------------------------------------ |
| `#/`                 | Portada                                    |
| `#/ingresar`         | P1 Inicio de sesión                        |
| `#/explorar`         | P2 Explorar espacios, con filtros por tipo |
| `#/espacio/:id`      | P3 Franjas y reserva (`?dia=0..6`)         |
| `#/comprobante/:rid` | P4 Comprobante                             |
| `#/liberar/:reserva` | P5 Liberar una parte (25, 50 o 75%)        |
| `#/perfil`           | P6 Perfil, promedio y puntos               |
| `#/mis-reservas`     | P7 Mis reservas y cancelación              |
| `#/check-in/:rid`    | P8 Check-in con QR                         |
| `#/reportar`         | P9 Reportar un daño                        |
| `#/top`              | P10 Top de estudiantes                     |

Las pantallas internas exigen sesión; al iniciarla se retoma la ruta que se pidió.

## Estructura

```
src/
├─ domain/        Reglas del negocio en TypeScript puro (sin React ni DOM), con sus pruebas
│  ├─ constants   Espacios, horas, puntos, pesos del índice, cuentas y datos de demostración
│  ├─ availability  Ocupación, estado de cada franja y porcentajes que caben
│  ├─ reservations  Reservar, liberar, cancelar, ventana de check-in y bonificación
│  ├─ ranking     Índice del top y desglose por métrica
│  ├─ validators  Inicio de sesión, promedio (0,0 a 5,0) y reporte de daño
│  ├─ describe    Textos en español derivados de las reglas
│  └─ seed        Estado de partida de la demostración
├─ store/         Estado en memoria: eventos, reducer, acciones, proveedor y selectores
├─ components/
│  ├─ ui/         Botones, placa, medidor por hora, puntos, diálogo accesible, avisos…
│  ├─ layout/     Cabecera, pestañas de móvil, pie, marco de página y control de acceso
│  └─ SpaceDirectory/  Tabla de espacios, compartida por la portada y Explorar
├─ features/      Una carpeta por área: landing, auth, explore, booking,
│                 reservations, ranking, profile, reports (cada una con su CSS)
├─ styles/        Tokens de diseño (tema claro por defecto y oscuro opcional), base y primitivas
├─ hooks/  lib/  app/
e2e/              Recorrido de la especificación en un navegador real
```

Las acciones del store (`store/actions.ts`) validan con el dominio y emiten eventos ya resueltos;
el reducer solo los aplica. Toda operación sobre reservas se limita al estudiante con sesión.

## Reglas implementadas

- **Reservar:** el primero en una franja libre se queda con el espacio completo. Si otro liberó una
  parte, solo se puede tomar 25, 50 o 75% dentro de lo liberado (los que no caben se deshabilitan).
  Las franjas llenas, las que ya pasaron y las propias no se pueden elegir. Antes de confirmar se
  muestra un resumen.
- **Cancelar:** quien tomó una parte libera su porcentaje; si cancela quien reservó primero, su parte
  queda libre y quienes tomaron partes conservan la suya.
- **Check-in:** desde 10 minutos antes hasta 15 minutos después del inicio. Suma 1 hora de uso.
- **Bonificación:** solo si el espacio se usó en compartido y todos hicieron check-in. Quien reservó
  primero recibe 20 puntos y cada estudiante que se unió, 5; si falta alguien queda «pendiente» y si
  nadie tomó la parte liberada no hay bonificación. Los puntos solo se acumulan y cuentan para el índice.
- **Índice del top:** `30 × (puntos ÷ máx.) + 35 × (promedio ÷ 5,0) + 35 × (horas ÷ máx.)`. Con 50 de 60
  puntos, promedio 4,2 y 13 de 22 horas da 75,1. Quien no registró su promedio no aparece en el top.

## Límites conocidos

- El reloj simulado está fijo en lunes 1:55 p. m., por eso «si no haces check-in, la reserva se
  libera» se comunica en los textos pero no ocurre por sí sola con el paso del tiempo.
- Los datos no se guardan: no hay servidor ni almacenamiento local.
- Las cuentas son de demostración: la contraseña está en el código, no hay autenticación real.

## Créditos

Tipografía [Bricolage Grotesque](https://github.com/ateliertriay/bricolage) (SIL Open Font License 1.1).
