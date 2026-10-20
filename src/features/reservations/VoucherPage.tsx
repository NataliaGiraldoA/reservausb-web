import './reservations.css';
import { Navigate, useParams } from 'react-router-dom';
import { paths } from '@/app/paths';
import { ButtonLink, Callout, DetailRows, Plaque, SuccessMark } from '@/components/ui';
import { peopleFor } from '@/domain/availability';
import { POINTS_JOINER, POINTS_OWNER } from '@/domain/constants';
import { dayFullLabel } from '@/domain/describe';
import { formatPeople, formatRange } from '@/domain/format';
import { canRelease, findReservation, ownerLabel } from '@/domain/reservations';
import { getSpace } from '@/domain/availability';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAppState } from '@/store';

/** Comprobante de una reserva recién confirmada. */
export function VoucherPage() {
  useDocumentTitle('Reserva confirmada');
  const { rid = '' } = useParams();
  const { bookings, session } = useAppState();
  const reservation = session ? findReservation(bookings, session, rid) : undefined;
  const space = reservation && getSpace(reservation.booking.spaceId);
  if (!reservation || !space) return <Navigate to={paths.reservations} replace />;

  const { booking } = reservation;
  const owner = booking.owner;
  const hasRealOwner = owner !== null && owner !== 'anon';

  return (
    <div className="wrap page">
      <div className="cols cols--even" style={{ alignItems: 'start' }}>
        <div>
          <SuccessMark />
          <h1 className="h1">Reserva confirmada</h1>
          <p className="lead" style={{ margin: '10px 0 28px' }}>
            {reservation.isOwner
              ? 'El espacio completo es tuyo en esta franja.'
              : 'Tomaste una parte del espacio liberado.'}
          </p>
          <div className="ticket">
            <div className="ticket__top">
              <Plaque space={space} size="lg" />
              <div>
                <small>Código de reserva</small>
                <div className="ticket__code">{reservation.rid}</div>
              </div>
            </div>
            <div className="ticket__cut" />
            <DetailRows
              rows={[
                ['Espacio', space.name],
                ['Fecha', dayFullLabel(booking.day)],
                ['Hora', formatRange(booking.hour)],
                [
                  'Tu parte',
                  reservation.isOwner
                    ? `Espacio completo (${formatPeople(space.capacity)})`
                    : `${reservation.pct}% (${formatPeople(peopleFor(space, reservation.pct))})`,
                ],
              ]}
            />
          </div>
        </div>

        <div className="col-offset">
          {canRelease(reservation) ? (
            <div className="panel">
              <h2 className="panel__t">¿No vas a usar todo el espacio?</h2>
              <p className="muted" style={{ marginBottom: 16 }}>
                Libera una parte para otros estudiantes. Si la toman y el espacio se usa, recibes{' '}
                {POINTS_OWNER} puntos de bonificación.
              </p>
              <ButtonLink size="sm" to={paths.release(booking.id)}>
                Liberar una parte
              </ButtonLink>
            </div>
          ) : (
            !reservation.isOwner && (
              <Callout>
                Compartes este espacio con {ownerLabel(owner)}. Cuando todos hagan check-in, recibes{' '}
                {POINTS_JOINER} puntos
                {hasRealOwner ? ` y ${ownerLabel(owner)} recibe ${POINTS_OWNER}` : ''}.
              </Callout>
            )
          )}
          <div className="stack" style={{ marginTop: 16 }}>
            <ButtonLink to={paths.reservations}>Ver mis reservas</ButtonLink>
            <ButtonLink variant="ghost" to={paths.explore}>
              Reservar otro espacio
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
