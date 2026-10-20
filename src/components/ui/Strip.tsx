import './Strip.css';
import { HOURS, NOW } from '@/domain/constants';
import { isPast, occupancy } from '@/domain/availability';
import { describeHour } from '@/domain/describe';
import { formatHour } from '@/domain/format';
import type { Space } from '@/domain/types';
import { useAppState } from '@/store';

interface Props {
  space: Space;
  day?: number;
  /** Versión alta, para el tablero de la portada. */
  tall?: boolean;
  /** Si se pasa, cada hora es un botón que avisa cuál se mira. */
  activeHour?: number;
  onHourFocus?: (hour: number) => void;
}

/**
 * Medidor de ocupación por hora, de 7:00 a. m. a 8:00 p. m.
 * Verde = cupo, gris azulado = ocupado, naranja = próxima hora, rayado = ya pasó.
 */
export function Strip({ space, day = 0, tall, activeHour, onHourFocus }: Props) {
  const { bookings } = useAppState();
  const interactive = onHourFocus !== undefined;
  const className = `strip${tall ? ' strip--tall' : ''}`;

  const cells = HOURS.map((hour, index) => {
    const past = isPast(day, hour);
    const occupied = past ? 0 : occupancy(bookings, space.id, day, hour);
    const state = past ? 'past' : day === NOW.day && hour === NOW.hour + 1 ? 'next' : '';
    const on = interactive && activeHour === hour ? 'on' : '';
    const cls = [state, on].filter(Boolean).join(' ') || undefined;
    const style = { '--o': `${occupied}%`, '--i': index } as React.CSSProperties;

    if (!interactive) return <i key={hour} className={cls} style={style} />;
    const text = `${formatHour(hour)}, ${describeHour(space, day, hour, occupancy(bookings, space.id, day, hour))}`;
    return (
      <button
        key={hour}
        type="button"
        className={cls}
        style={style}
        aria-label={text}
        onMouseEnter={() => onHourFocus(hour)}
        onFocus={() => onHourFocus(hour)}
        onClick={() => onHourFocus(hour)}
      />
    );
  });

  if (interactive) {
    return (
      <div className={className} role="group" aria-label="Horas del día">
        {cells}
      </div>
    );
  }
  return (
    <div
      className={className}
      role="img"
      aria-label={`Ocupación de ${space.name} de 7 a. m. a 8 p. m. Cada barra es una hora; la parte verde es el cupo que queda.`}
    >
      {cells}
    </div>
  );
}
