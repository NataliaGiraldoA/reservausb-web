import type { AppEvent } from './events';
import { reducer } from './reducer';
import type { AppState } from './state';

/** Almacén mínimo en memoria, compatible con `useSyncExternalStore`. */
export interface Store {
  getState(): AppState;
  emit(event: AppEvent): void;
  subscribe(listener: () => void): () => void;
}

export function createStore(initial: AppState): Store {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    emit(event) {
      state = reducer(state, event);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
