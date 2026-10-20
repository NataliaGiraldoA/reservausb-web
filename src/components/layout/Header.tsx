import { Link, useLocation } from 'react-router-dom';
import { paths } from '@/app/paths';
import { BrandMark, Icon } from '@/components/ui';
import { scrollToId } from '@/lib/scroll';
import { myReservations, sessionUser, totalPoints, useAppState } from '@/store';
import { NAV_ITEMS, activeNavPath } from './navigation';
import { ThemeToggle } from './ThemeToggle';

const LANDING_SECTIONS = [
  ['como-funciona', 'Cómo funciona'],
  ['compartir', 'Compartir'],
  ['espacios', 'Espacios'],
] as const;

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function Header() {
  const state = useAppState();
  const { pathname } = useLocation();
  const user = sessionUser(state);
  const active = activeNavPath(pathname);
  const count = myReservations(state).length;
  const onLanding = pathname === paths.landing;
  const onLogin = pathname === paths.login;

  return (
    <header className="hdr">
      <div className="wrap hdr__in">
        <Link
          className="logo"
          to={user ? paths.explore : paths.landing}
          aria-label="ReservaUSB, inicio"
        >
          <BrandMark size={32} />
          ReservaUSB
        </Link>

        <nav className="hdr__nav" aria-label="Principal">
          {user
            ? NAV_ITEMS.slice(0, 3).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active === item.to ? 'page' : undefined}
                >
                  {item.label}
                  {item.to === paths.reservations && count > 0 && (
                    <span className="count">{count}</span>
                  )}
                </Link>
              ))
            : onLanding &&
              LANDING_SECTIONS.map(([id, label]) => (
                <button key={id} type="button" onClick={() => scrollToId(id)}>
                  {label}
                </button>
              ))}
        </nav>

        <div className="hdr__end">
          <ThemeToggle />
          {user ? (
            <>
              <Link className="ptschip" to={paths.profile} aria-label="Mis puntos">
                <Icon name="star" size={17} />
                <span>{totalPoints(state, user.id)} puntos</span>
              </Link>
              <Link className="avatar" to={paths.profile} aria-label="Mi perfil">
                {initials(user.firstName)}
              </Link>
            </>
          ) : (
            !onLogin && (
              <Link className="btn btn--sm" to={paths.login}>
                Iniciar sesión
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
