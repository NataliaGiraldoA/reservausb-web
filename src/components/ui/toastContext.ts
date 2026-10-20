import { createContext, useContext } from 'react';

export interface ToastApi {
  show: (message: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** Muestra un aviso breve en la parte inferior de la pantalla. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return api;
}
