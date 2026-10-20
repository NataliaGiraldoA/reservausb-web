/** Rutas de la app. Se usa `HashRouter`, así que funciona abriendo el archivo directamente. */
export const paths = {
  landing: '/',
  login: '/ingresar',
  explore: '/explorar',
  space: (spaceId: string, day?: number) =>
    day ? `/espacio/${spaceId}?dia=${day}` : `/espacio/${spaceId}`,
  voucher: (rid: string) => `/comprobante/${rid}`,
  release: (bookingId: number) => `/liberar/${bookingId}`,
  reservations: '/mis-reservas',
  checkIn: (rid: string) => `/check-in/${rid}`,
  top: '/top',
  profile: '/perfil',
  report: (spaceId?: string) => (spaceId ? `/reportar?espacio=${spaceId}` : '/reportar'),
} as const;
