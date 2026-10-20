import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppState } from '@/store';
import { Footer } from './Footer';
import { Header } from './Header';
import { TabBar } from './TabBar';
import './layout.css';

/**
 * Marco común de todas las pantallas. Al cambiar de ruta lleva la vista al inicio y mueve el
 * foco al contenido, como lo haría una carga de página nueva.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const { session } = useAppState();
  const main = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    document.body.classList.toggle('has-tabbar', session !== null);
    return () => document.body.classList.remove('has-tabbar');
  }, [session]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
          main.current?.scrollIntoView();
        }}
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="main" ref={main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <TabBar />
    </>
  );
}
