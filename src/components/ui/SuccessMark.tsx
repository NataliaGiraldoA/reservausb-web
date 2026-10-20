import { Icon } from './Icon';

/** Círculo verde con una marca de verificación, para las pantallas de confirmación. */
export function SuccessMark() {
  return (
    <div className="ok">
      <Icon name="check" size={36} strokeWidth={2.8} style={{ color: '#fff' }} />
    </div>
  );
}
