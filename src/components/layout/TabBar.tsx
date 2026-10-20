import { Link, useLocation } from 'react-router-dom';
import { paths } from '@/app/paths';
import { Icon } from '@/components/ui';
import { myReservations, useAppState } from '@/store';
import { NAV_ITEMS, activeNavPath } from './navigation';

/** Navegación inferior para pantallas angostas. */
export function TabBar() {
  const state = useAppState();
  const { pathname } = useLocation();
  if (!state.session) return null;
  const active = activeNavPath(pathname);
  const count = myReservations(state).length;

  return (
    <nav className="tabbar" aria-label="Principal">
      {NAV_ITEMS.map((item) => (
        <Link key={item.to} to={item.to} aria-current={active === item.to ? 'page' : undefined}>
          <Icon name={item.icon} size={23} />
          {item.label}
          {item.to === paths.reservations && count > 0 && <span className="count">{count}</span>}
        </Link>
      ))}
    </nav>
  );
}
