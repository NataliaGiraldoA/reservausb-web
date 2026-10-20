import './reservations.css';
import { useRef, useState } from 'react';
import { paths } from '@/app/paths';
import { BrandMark, Button, ButtonLink, Dialog, useToast } from '@/components/ui';
import { getSpace } from '@/domain/availability';
import { cancelDescription } from '@/domain/describe';
import { formatRange, pluralize } from '@/domain/format';
import { findReservation } from '@/domain/reservations';
import { CHECK_IN_MINUTES_AFTER, CHECK_IN_MINUTES_BEFORE } from '@/domain/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { myReservations, useActions, useAppState } from '@/store';
import { ReservationCard } from './ReservationCard';

function CancelDialog({ rid, onClose }: { rid: string; onClose: () => void }) {
  const state = useAppState();
  const actions = useActions();
  const toast = useToast();
  const keep = useRef<HTMLButtonElement>(null);
  const reservation = state.session
    ? findReservation(state.bookings, state.session, rid)
    : undefined;
  const space = reservation && getSpace(reservation.booking.spaceId);
  if (!reservation || !space) return null;

  const confirm = () => {
    const result = actions.cancel(rid);
    onClose();
    if (result.ok) {
      toast.show(
        result.spaceFreed
          ? 'Reserva cancelada. El espacio quedó libre para otros estudiantes.'
          : 'Reserva cancelada. Tu parte quedó libre para otros estudiantes.',
      );
    }
  };

  return (
    <Dialog
      role="alertdialog"
      title="¿Cancelar esta reserva?"
      description={cancelDescription(reservation, space, formatRange(reservation.booking.hour))}
      onClose={onClose}
      initialFocus={keep}
    >
      <div className="stack">
        <Button variant="danger" onClick={confirm}>
          Sí, cancelar reserva
        </Button>
        <button ref={keep} type="button" className="btn btn--ghost" onClick={onClose}>
          Mantener reserva
        </button>
      </div>
    </Dialog>
  );
}

export function MyReservationsPage() {
  useDocumentTitle('Mis reservas');
  const state = useAppState();
  const reservations = myReservations(state);
  const [cancelRid, setCancelRid] = useState<string | null>(null);
  const count = reservations.length;

  return (
    <div className="wrap page">
      <header className="pagehead">
        <div>
          <p className="kicker">
            {count} {pluralize(count, 'reserva activa', 'reservas activas')}
          </p>
          <h1 className="h1">Mis reservas</h1>
        </div>
        <ButtonLink variant="ghost" size="sm" to={paths.explore}>
          Reservar otro espacio
        </ButtonLink>
      </header>

      {count === 0 ? (
        <div className="empty">
          <BrandMark size={52} />
          <h3 className="h3">No tienes reservas activas</h3>
          <p>Cuando reserves un espacio aparecerá aquí, con su código y el botón de check-in.</p>
          <ButtonLink to={paths.explore}>Reservar un espacio</ButtonLink>
        </div>
      ) : (
        <div className="cols">
          <div>
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.rid}
                reservation={reservation}
                onCancel={setCancelRid}
              />
            ))}
          </div>
          <aside className="sticky">
            <div className="panel">
              <h2 className="panel__t">Cómo funciona el check-in</h2>
              <ol className="howto">
                <li>
                  El check-in se habilita {CHECK_IN_MINUTES_BEFORE} minutos antes de la hora de
                  inicio y sigue disponible hasta {CHECK_IN_MINUTES_AFTER} minutos después.
                </li>
                <li>Busca el código QR pegado en la puerta del espacio.</li>
                <li>Escanéalo desde esta página. Si no lo haces a tiempo, la reserva se libera.</li>
              </ol>
            </div>
          </aside>
        </div>
      )}

      {cancelRid && <CancelDialog rid={cancelRid} onClose={() => setCancelRid(null)} />}
    </div>
  );
}
