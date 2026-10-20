import { useEffect } from 'react';

const SITE = 'ReservaUSB';

/** Pone el título de la pestaña: `Mis reservas · ReservaUSB`. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ${SITE}`;
  }, [title]);
}
