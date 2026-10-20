import './reservations.css';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { paths } from '@/app/paths';
import { Breadcrumbs, Button, ButtonLink, Icon, QrCode, SuccessMark } from '@/components/ui';
import { getSpace } from '@/domain/availability';
import { NOW } from '@/domain/constants';
import { checkInWindowText, dayLabel, participationText } from '@/domain/describe';
import { formatClock, formatRange } from '@/domain/format';
import { canCheckIn, findReservation } from '@/domain/reservations';
import type { CheckInOutcome } from '@/domain/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useActions, useAppState } from '@/store';

/** Lo que tarda la simulación de lectura del QR. */
const SCAN_MS = 1400;

type Phase = 'idle' | 'scanning' | 'done';

export function CheckInPage() {
  useDocumentTitle('Check-in');
  const { rid = '' } = useParams();
  const { bookings, session } = useAppState();
  const actions = useActions();
  const [phase, setPhase] = useState<Phase>('idle');
  const [outcome, setOutcome] = useState<CheckInOutcome | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reservation = session ? findReservation(bookings, session, rid) : undefined;
  const space = reservation && getSpace(reservation.booking.spaceId);
  if (!reservation || !space) return <Navigate to={paths.reservations} replace />;

  const { booking } = reservation;
  const open = canCheckIn(reservation);
  const crumbs = [{ label: 'Mis reservas', to: paths.reservations }, { label: 'Check-in' }];

  const summary = (
    <div className="panel">
      <div className="resv__when">
        {dayLabel(booking.day)}, {formatRange(booking.hour)}
      </div>
      <h2 className="h3" style={{ margin: '4px 0 6px' }}>
        {space.name}
      </h2>
      <p className="muted small">{participationText(reservation, space)}</p>
    </div>
  );

  const scan = () => {
    setPhase('scanning');
    timer.current = window.setTimeout(() => {
      const result = actions.checkIn(rid);
      setOutcome(result.ok ? result.outcome : null);
      setPhase('done');
    }, SCAN_MS);
  };

  if (phase === 'done') {
    return (
      <div className="wrap page">
        <Breadcrumbs items={crumbs} />
        <div className="cols cols--even">
          <div>
            <SuccessMark />
            <h1 className="h1">Check-in registrado</h1>
            <p className="lead" style={{ margin: '10px 0 24px' }}>
              Llegada confirmada a las {formatClock(NOW.hour, NOW.minute)} Sumas 1 hora de uso.
            </p>
            {summary}
          </div>
          <div className="col-offset">
            {outcome && (
              <div className="pointsgot">
                {outcome.points > 0 ? (
                  <b>+{outcome.points} puntos</b>
                ) : (
                  <b style={{ fontSize: 24 }}>
                    {outcome.kind === 'pending' ? 'Bonificación pendiente' : 'Sin bonificación'}
                  </b>
                )}
                <span className="small">{outcome.message}</span>
              </div>
            )}
            <div className="stack" style={{ marginTop: 16 }}>
              <ButtonLink to={paths.reservations}>Volver a mis reservas</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const scanning = phase === 'scanning';
  return (
    <div className="wrap page">
      <Breadcrumbs items={crumbs} />
      <div className="cols cols--even">
        <div>
          <h1 className="h1">Check-in</h1>
          <div style={{ margin: '22px 0 18px' }}>{summary}</div>
          <div className={`win${open ? '' : ' win--off'}`}>
            <Icon name="clock" size={20} />
            <span>
              {reservation.done
                ? 'Ya registraste tu llegada a esta reserva.'
                : checkInWindowText(booking)}
            </span>
          </div>
          <ol className="howto" style={{ marginTop: 14 }}>
            <li>Ve al espacio y busca el QR en la puerta.</li>
            <li>Pulsa Escanear código QR y apunta al código.</li>
            <li>Cuando se lea, tu llegada queda registrada.</li>
          </ol>
        </div>

        <div>
          <div className="viewer">
            <span className="corner c1" />
            <span className="corner c2" />
            <span className="corner c3" />
            <span className="corner c4" />
            <QrCode />
            {scanning ? (
              <>
                <span className="laser" />
                <p>Leyendo código…</p>
              </>
            ) : (
              <p>Apunta al QR pegado en la puerta</p>
            )}
          </div>
          <div style={{ width: 'min(100%, 460px)', margin: '18px auto 0' }}>
            <Button size="lg" block disabled={!open || scanning} onClick={scan}>
              <Icon name="qr" size={20} />
              {scanning ? 'Escaneando…' : 'Escanear código QR'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
