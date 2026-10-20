import { Button, Callout, Dots, Icon } from '@/components/ui';
import { peopleFor, selectablePercents, type SlotState } from '@/domain/availability';
import { POINTS_JOINER, SHARE_PERCENTS } from '@/domain/constants';
import { dayLabel } from '@/domain/describe';
import { formatHour, formatPeople, formatRange } from '@/domain/format';
import { ownerLabel } from '@/domain/reservations';
import type { Booking, SharePercent, Space } from '@/domain/types';

interface Props {
  space: Space;
  day: number;
  slot: SlotState | null;
  /** Reserva existente en la franja elegida, si alguien ya reservó. */
  booking: Booking | undefined;
  percent: SharePercent | null;
  onPercent: (percent: SharePercent) => void;
  onReview: () => void;
  /** En pantallas angostas el panel es una hoja inferior. */
  open: boolean;
  onClose: () => void;
}

/** Panel "Tu reserva": qué parte se reserva y qué falta para poder confirmar. */
export function BookPanel({
  space,
  day,
  slot,
  booking,
  percent,
  onPercent,
  onReview,
  open,
  onClose,
}: Props) {
  const className = `panel panel--night book sticky${open ? ' open' : ''}`;
  const heading = (
    <>
      <button type="button" className="book__close" onClick={onClose} aria-label="Cerrar">
        <Icon name="close" size={18} strokeWidth={2.2} />
      </button>
      <h2 className="h3">Tu reserva</h2>
    </>
  );

  if (!slot) {
    return (
      <aside className={className} id="book" aria-label="Tu reserva">
        {heading}
        <p className="book__empty">
          Elige una hora de la agenda. Si está libre reservas el espacio completo; si otro
          estudiante liberó una parte, puedes tomarla.
        </p>
        <div className="book__empty">
          <Dots capacity={space.capacity} segments={[]} />
          <span className="tiny">{formatPeople(space.capacity)}, ninguna elegida</span>
        </div>
      </aside>
    );
  }

  const first = slot.kind === 'free';
  const takenByOthers = Math.round((space.capacity * slot.occupied) / 100);
  const chosen = first ? 100 : (percent ?? 0);
  const mine = first
    ? space.capacity
    : chosen
      ? Math.min(peopleFor(space, chosen), space.capacity - takenByOthers)
      : 0;
  const enabled = selectablePercents(slot.available);
  const needsPercent = !first && percent === null;
  const who =
    booking?.owner && booking.owner !== 'anon' ? ownerLabel(booking.owner) : 'Otro estudiante';

  return (
    <aside className={className} id="book" aria-label="Tu reserva">
      {heading}
      <p className="book__when">
        {dayLabel(day)}, {formatRange(slot.hour)}
      </p>
      <Dots
        capacity={space.capacity}
        segments={[
          { kind: 'taken', count: takenByOthers },
          { kind: 'mine', count: mine },
        ]}
      />
      <p className="tiny" style={{ color: 'var(--on-night-muted)' }}>
        Capacidad de {formatPeople(space.capacity)}:{' '}
        {takenByOthers ? `${takenByOthers} ocupadas, ` : ''}
        {mine ? `${mine} para ti` : 'ninguna elegida todavía'}
      </p>

      {first ? (
        <Callout>
          Eres el primero en esta franja: reservas el espacio completo y después puedes liberar una
          parte para otros estudiantes.
        </Callout>
      ) : (
        <>
          <p className="book__q" id="book-question">
            ¿Qué parte quieres tomar?
          </p>
          <div className="pcts" role="group" aria-labelledby="book-question">
            {SHARE_PERCENTS.map((p) => (
              <button
                key={p}
                type="button"
                className="pct"
                disabled={!enabled.includes(p)}
                aria-pressed={percent === p}
                onClick={() => onPercent(p)}
              >
                {p}%<small>{peopleFor(space, p)} pers.</small>
              </button>
            ))}
          </div>
          <Callout>
            {who} reservó este espacio y liberó el {slot.available}%. Si tomas una parte y el
            espacio se usa, recibes {POINTS_JOINER} puntos.
          </Callout>
        </>
      )}

      <div style={{ height: 20 }} />
      <Button block disabled={needsPercent} onClick={onReview}>
        {needsPercent
          ? 'Elige qué parte tomar'
          : first
            ? 'Reservar el espacio completo'
            : `Tomar ${percent}% a las ${formatHour(slot.hour)}`}
      </Button>
    </aside>
  );
}
