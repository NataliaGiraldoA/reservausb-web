import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createActions, type Actions } from './actions';
import { createInitialState, type AppState } from './state';
import { createStore } from './store';

const StateContext = createContext<AppState | null>(null);
const ActionsContext = createContext<Actions | null>(null);

interface Props {
  children: ReactNode;
  /** Estado inicial; en las pruebas se puede pasar uno propio. */
  initialState?: AppState;
}

/**
 * Guarda el estado en memoria (los datos de la demostración se reinician al recargar).
 * El almacén vive fuera del render, así que una acción siempre lee datos al día aunque se
 * dispare dos veces antes de que React vuelva a renderizar.
 */
export function StoreProvider({ children, initialState }: Props) {
  const [store] = useState(() => createStore(initialState ?? createInitialState()));
  const [actions] = useState(() => createActions(store));
  const state = useSyncExternalStore(store.subscribe, store.getState);

  return (
    <StateContext.Provider value={state}>
      <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
    </StateContext.Provider>
  );
}

function useRequired<T>(value: T | null, name: string): T {
  if (value === null) throw new Error(`${name} debe usarse dentro de <StoreProvider>`);
  return value;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState(): AppState {
  return useRequired(useContext(StateContext), 'useAppState');
}

// eslint-disable-next-line react-refresh/only-export-components
export function useActions(): Actions {
  return useRequired(useContext(ActionsContext), 'useActions');
}
