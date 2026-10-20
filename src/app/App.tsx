import { HashRouter } from 'react-router-dom';
import { ToastProvider } from '@/components/ui';
import { StoreProvider } from '@/store';
import { AppRoutes } from './AppRoutes';

/**
 * `HashRouter` mantiene las rutas en el fragmento (`#/explorar`), así la app funciona igual
 * servida desde cualquier carpeta o abierta como archivo, sin configurar el servidor.
 */
export function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
