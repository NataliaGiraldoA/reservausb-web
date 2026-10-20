import './reservations.css';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { paths } from '@/app/paths';
import {
  Breadcrumbs,
  Button,
  ButtonLink,
  Callout,
  DetailRows,
  Dots,
  SegmentedControl,
  SuccessMark,
} from '@/components/ui';
import { getSpace, peopleFor } from '@/domain/availability';
import { POINTS_JOINER, POINTS_OWNER, SHARE_PERCENTS } from '@/domain/constants';
import { dayLabel } from '@/domain/describe';
import { formatPeople, formatRange, pluralize } from '@/domain/format';
import { findBookingById } from '@/domain/reservations';
import type { SharePercent } from '@/domain/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useActions, useAppState } from '@/store';

/** Quien reservó primero elige liberar 25, 50 o 75%. */
export function ReleasePage() {
  useDocumentTitle('Liberar parte del espacio');
  const { bookingId } = useParams();
  const { bookings, session } = useAppState();
  const actions = useActions();
  const navigate = useNavigate();
  const [percent, setPercent] = useState<SharePercent | null>(null);
  const [done, setDone] = useState(false);

  const booking = findBookingById(bookings, Number(bookingId));
  const space = booking && getSpace(booking.spaceId);
  const allowed = booking && booking.owner === session && (booking.released === 0 || done);
  if (!booking || !space || !allowed) return <Navigate to={paths.reservations} replace />;

  const when = `${dayLabel(booking.day)}, ${formatRange(booking.hour)}`;

  if (done) {
    const released = peopleFor(space, booking.released);
    const kept = peopleFor(space, 100 - booking.released);
    return (
      <div className="wrap page">
        <div className="cols cols--even">
          <div>
            <SuccessMark />
            <h1 className="h1">Liberaste el {booking.released}%</h1>
            <p className="lead" style={{ margin: '10px 0 24px' }}>
              Ya aparece disponible para otros estudiantes en esta franja.
            </p>
            <Dots
              large
              capacity={space.capacity}
              segments={[
                { kind: 'mine', count: space.capacity - released },
                { kind: 'taken', count: released },
              ]}
            />
            <DetailRows
              style={{ marginTop: 24 }}
              rows={[
                ['Espacio', space.name],
                ['Hora', when],
                ['Te quedas con', `${100 - booking.released}% (${formatPeople(kept)})`],
                ['Liberaste', `${booking.released}% (${formatPeople(released)})`],
              ]}
            />
          </div>
          <div className="col-offset">
            <Callout>
              Si otros toman esta parte y todos hacen check-in, recibes {POINTS_OWNER} puntos de
              bonificación y cada estudiante que se una recibe {POINTS_JOINER}.
            </Callout>
            <div className="stack" style={{ marginTop: 16 }}>
              <Button onClick={() => navigate(paths.space(space.id, booking.day))}>
                Ver la franja
              </Button>
              <ButtonLink variant="ghost" to={paths.reservations}>
                Ir a mis reservas
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const releasedPeople = percent ? peopleFor(space, percent) : 0;
  const keptPeople = space.capacity - releasedPeople;

  return (
    <div className="wrap page">
      <Breadcrumbs
        items={[
          { label: 'Mis reservas', to: paths.reservations },
          { label: 'Liberar parte del espacio' },
        ]}
      />
      <div className="cols cols--even">
        <div>
          <h1 className="h1">Libera una parte del espacio</h1>
          <DetailRows
            style={{ margin: '24px 0' }}
            rows={[
              ['Espacio', space.name],
              ['Hora', when],
              ['Ahora reservaste', `Espacio completo (${formatPeople(space.capacity)})`],
            ]}
          />
          <p className="label" id="release-question">
            ¿Qué parte quieres liberar?
          </p>
          <div style={{ marginBottom: 22 }}>
            <SegmentedControl
              labelledBy="release-question"
              value={percent}
              onChange={setPercent}
              options={SHARE_PERCENTS.map((p) => ({
                value: p,
                label: (
                  <>
                    {p}% <span className="muted tiny">({peopleFor(space, p)} pers.)</span>
                  </>
                ),
              }))}
            />
          </div>
          <Dots
            large
            capacity={space.capacity}
            segments={[
              { kind: 'mine', count: keptPeople },
              { kind: 'taken', count: releasedPeople },
            ]}
          />
          <div className="share__who">
            <div>
              <i style={{ background: 'var(--orange)' }} />
              Tú, {keptPeople} {pluralize(keptPeople, 'persona', 'personas')}
            </div>
            <div>
              <i style={{ background: 'var(--occ)' }} />
              Quien la tome, {releasedPeople}
            </div>
          </div>
        </div>

        <div className="col-offset">
          <Callout>
            Si otros toman lo que liberas y todos hacen check-in, recibes {POINTS_OWNER} puntos de
            bonificación y cada estudiante que se una recibe {POINTS_JOINER}. Los puntos se acumulan
            cada vez que compartes.
          </Callout>
          <div style={{ marginTop: 16 }}>
            <Button
              block
              disabled={percent === null}
              onClick={() => {
                if (percent && actions.release(booking.id, percent).ok) setDone(true);
              }}
            >
              {percent ? `Liberar ${percent}% del espacio` : 'Elige qué parte liberar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
