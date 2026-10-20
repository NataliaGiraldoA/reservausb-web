import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { paths } from '@/app/paths';
import { useAppState } from '@/store';

/**
 * Pantallas solo para estudiantes con sesión.
 * - Sin sesión desde el principio: lleva a iniciar sesión y, al volver, retoma la ruta pedida.
 * - Si la sesión se cierra estando dentro: vuelve a la portada.
 */
export function RequireAuth() {
  const { session } = useAppState();
  const location = useLocation();
  const [wasSignedIn, setWasSignedIn] = useState(session !== null);
  if (session && !wasSignedIn) setWasSignedIn(true);

  if (!session) {
    if (wasSignedIn) return <Navigate to={paths.landing} replace />;
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return <Outlet />;
}
