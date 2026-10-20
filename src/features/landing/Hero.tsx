import { useState } from 'react';
import { Link } from 'react-router-dom';
import { paths } from '@/app/paths';
import { Button, ButtonLink, Legend, Plaque, Strip } from '@/components/ui';
import { highlightHour, occupancy } from '@/domain/availability';
import { HOURS, SPACES } from '@/domain/constants';
import { describeHour } from '@/domain/describe';
import { formatHour, formatHourShort } from '@/domain/format';
import { scrollToId } from '@/lib/scroll';
import { useAppState } from '@/store';

const EXAMPLES = [
  { spaceId: 'b204', label: 'Sala' },
  { spaceId: 'can1', label: 'Cancha' },
  { spaceId: 'l101', label: 'Laboratorio' },
] as const;

/** Posiciones (índice de hora) de las marcas del eje del tablero. */
const AXIS_TICKS = [0, 3, 6, 9, 12];

function Board() {
  const { bookings } = useAppState();
  const [spaceId, setSpaceId] = useState<string>(EXAMPLES[0].spaceId);
  const [hour, setHour] = useState(() => highlightHour(bookings, EXAMPLES[0].spaceId));
  const space = SPACES.find((s) => s.id === spaceId) ?? SPACES[0]!;

  const chooseSpace = (id: string) => {
    setSpaceId(id);
    setHour(highlightHour(bookings, id));
  };

  return (
    <div className="board grow">
      <div className="board__top">
        <span className="small">Hoy, lunes 28 de septiembre</span>
        <div className="pilltabs" role="group" aria-label="Elegir un espacio de ejemplo">
          {EXAMPLES.map((example) => (
            <button
              key={example.spaceId}
              type="button"
              aria-pressed={spaceId === example.spaceId}
              onClick={() => chooseSpace(example.spaceId)}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <div className="board__id">
        <Plaque space={space} size="xl" />
        <div>
          <h2>{space.name}</h2>
          <p>
            {space.where}, capacidad {space.capacity} personas
          </p>
        </div>
      </div>

      <Strip key={space.id} space={space} tall activeHour={hour} onHourFocus={setHour} />
      <div className="strip__lbl" aria-hidden="true">
        {AXIS_TICKS.map((index) => (
          <span
            key={index}
            style={
              index === HOURS.length - 1
                ? { right: 0 }
                : { left: `calc(${index} * (100% + 5px) / ${HOURS.length})` }
            }
          >
            {formatHourShort(HOURS[index]!)}
          </span>
        ))}
      </div>

      <p className="readout" aria-live="polite">
        <b>{formatHour(hour)}</b>,{' '}
        {describeHour(space, 0, hour, occupancy(bookings, space.id, 0, hour))}
      </p>

      <div className="board__foot">
        <Legend />
        <Link className="btn btn--sm" to={paths.space(space.id)}>
          Reservar {space.code}
        </Link>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <h1 className="display">Reserva y comparte los espacios del campus</h1>
          <p className="lead">
            Salas de estudio, canchas y laboratorios de la USB Cali. Ves cuánto está ocupado cada
            espacio, hora por hora, antes de reservar.
          </p>
          <div className="hero__cta">
            <ButtonLink size="lg" to={paths.login}>
              Iniciar sesión
            </ButtonLink>
            <Button variant="ghost" size="lg" onClick={() => scrollToId('espacios')}>
              Ver los espacios
            </Button>
          </div>
          <p className="hero__note">
            Entra con tu correo institucional, el que termina en usbcali.edu.co.
          </p>
        </div>
        <Board />
      </div>
    </section>
  );
}
