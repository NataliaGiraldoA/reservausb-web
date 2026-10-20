import { paths } from '@/app/paths';
import { Button, ButtonLink } from '@/components/ui';
import { getSpace } from '@/domain/availability';
import { DAYS } from '@/domain/constants';
import { dayLabel, participationText } from '@/domain/describe';
import { formatRange } from '@/domain/format';
import { canCheckIn, canRelease } from '@/domain/reservations';
import type { Reservation } from '@/domain/types';

interface Props {
  reservation: Reservation;
  onCancel: (rid: string) => void;
}

/** Una reserva activa con sus acciones: check-in, liberar y cancelar. */
export function ReservationCard({ reservation, onCancel }: Props) {
  const { booking } = reservation;
  const space = getSpace(booking.spaceId);
  if (!space) return null;
  const day = DAYS[booking.day]!;
  const ready = canCheckIn(reservation);

  return (
    <article className={`resv${ready ? ' resv--ready' : ''}`}>
      <div className={`date${booking.day === 0 ? ' date--today' : ''}`}>
        <small>{day.short}</small>
        <b>{day.date}</b>
      </div>
      <div>
        <div className="resv__when">
          {dayLabel(booking.day)}, {formatRange(booking.hour)}
        </div>
        <h2 className="h3">{space.name}</h2>
        <div className="resv__meta">
          {participationText(reservation, space)}{' '}
          <span className="pill pill--code">{reservation.rid}</span>
          {reservation.done && <span className="pill">Check-in hecho</span>}
        </div>
      </div>
      <div className="resv__acts">
        {ready && (
          <ButtonLink size="sm" to={paths.checkIn(reservation.rid)}>
            Hacer check-in
          </ButtonLink>
        )}
        {canRelease(reservation) && (
          <ButtonLink variant="ghost" size="sm" to={paths.release(booking.id)}>
            Liberar parte
          </ButtonLink>
        )}
        {!reservation.done && (
          <Button variant="ghost" size="sm" onClick={() => onCancel(reservation.rid)}>
            Cancelar
          </Button>
        )}
      </div>
    </article>
  );
}
