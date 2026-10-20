import { paths } from '@/app/paths';
import type { IconName } from '@/components/ui';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

/** Navegación principal de la persona con sesión: Explorar, Mis reservas, Top y Perfil. */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: paths.explore, label: 'Explorar', icon: 'explore' },
  { to: paths.reservations, label: 'Mis reservas', icon: 'cal' },
  { to: paths.top, label: 'Top', icon: 'trophy' },
  { to: paths.profile, label: 'Perfil', icon: 'user' },
];

/** Qué elemento del menú corresponde a una ruta (las pantallas hijas resaltan a su sección). */
export function activeNavPath(pathname: string): string | null {
  const first = pathname.split('/')[1] ?? '';
  switch (first) {
    case 'explorar':
    case 'espacio':
      return paths.explore;
    case 'mis-reservas':
    case 'comprobante':
    case 'liberar':
    case 'check-in':
      return paths.reservations;
    case 'top':
      return paths.top;
    case 'perfil':
    case 'reportar':
      return paths.profile;
    default:
      return null;
  }
}
