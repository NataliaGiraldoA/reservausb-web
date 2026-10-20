import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui';
import { applyTheme, currentTheme, subscribeTheme } from '@/lib/theme';

/** Alterna entre el tema claro (por defecto) y el oscuro. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme);
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="themebtn"
      aria-pressed={dark}
      aria-label="Tema oscuro"
      title={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      onClick={() => applyTheme(dark ? 'light' : 'dark')}
    >
      <Icon name={dark ? 'sun' : 'moon'} size={19} />
    </button>
  );
}
