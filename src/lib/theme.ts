export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'reservausb-theme';
const listeners = new Set<() => void>();

/** Tema guardado; claro si no hay ninguno o el navegador no deja leer el almacenamiento. */
export function readTheme(): Theme {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Sin almacenamiento el tema vale solo para esta visita.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
