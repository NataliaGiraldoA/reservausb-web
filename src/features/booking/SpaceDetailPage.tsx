import './booking.css';
import { useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { paths } from '@/app/paths';
import { Breadcrumbs, Button, Icon, Legend, Plaque, useToast } from '@/components/ui';
import { findBooking, slotsForDay } from '@/domain/availability';
import { DAYS, SPACES } from '@/domain/constants';
import { dayFullLabel, dayLabel } from '@/domain/describe';
import { formatHour } from '@/domain/format';
import type { SharePercent, Space } from '@/domain/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useActions, useAppState } from '@/store';
import { BookPanel } from './BookPanel';
import { DayBar } from './DayBar';
import { ReviewDialog } from './ReviewDialog';
import { SlotList } from './SlotList';

interface Selection {
  hour: number;
  percent: SharePercent | null;
}

function parseDay(value: string | null): number {
  const day = Number(value);
  return Number.isInteger(day) && day >= 0 && day < DAYS.length ? day : 0;
}

function SpaceDetail({ space }: { space: Space }) {
  useDocumentTitle(`Disponibilidad · ${space.name}`);
  const { bookings, session } = useAppState();
  const actions = useActions();
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const day = parseDay(params.get('dia'));

  const [selection, setSelection] = useState<Selection | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const slots = slotsForDay(bookings, space.id, day, session);
  const slot = selection ? (slots.find((s) => s.hour === selection.hour) ?? null) : null;
  const booking = selection ? findBooking(bookings, space.id, day, selection.hour) : undefined;

  const changeDay = (next: number) => {
    setParams(next ? { dia: String(next) } : {}, { replace: true });
    setSelection(null);
    setPanelOpen(false);
  };

  const confirm = () => {
    if (!selection || !slot) return;
    const percent = slot.kind === 'free' ? null : selection.percent;
    const result = actions.reserve(space.id, day, selection.hour, percent);
    setReviewing(false);
    if (result.ok && result.rid) {
      navigate(paths.voucher(result.rid));
      return;
    }
    setSelection(null);
    setPanelOpen(false);
    toast.show('Esa franja ya no está disponible. Elige otra hora.');
  };

  const ready = slot !== null && (slot.kind === 'free' || selection?.percent != null);

  return (
    <>
      <div className="wrap page detail-pad">
        <Breadcrumbs items={[{ label: 'Explorar', to: paths.explore }, { label: space.name }]} />
        <header className="spacehead">
          <Plaque space={space} size="lg" />
          <div className="grow1">
            <h1 className="h1">{space.name}</h1>
            <div className="meta">
              <span>
                <Icon name="pin" size={17} />
                {space.where}
              </span>
              <span>
                <Icon name="users" size={17} />
                Capacidad {space.capacity} personas
              </span>
            </div>
          </div>
        </header>

        <div className="cols">
          <div>
            <DayBar day={day} onChange={changeDay} />
            <div className="agendahead">
              <h2 className="h3">{dayFullLabel(day)}</h2>
              <Legend showNext={false} />
            </div>
            <SlotList
              space={space}
              slots={slots}
              selectedHour={selection?.hour ?? null}
              selectedPercent={selection?.percent ?? 0}
              onSelect={(hour) => {
                setSelection({ hour, percent: null });
                setPanelOpen(false);
              }}
            />
            <p className="muted small" style={{ marginTop: 14 }}>
              La barra muestra qué parte del espacio está ocupada (gris) y cuál sigue libre (verde).
            </p>
          </div>

          <BookPanel
            space={space}
            day={day}
            slot={slot}
            booking={booking}
            percent={selection?.percent ?? null}
            onPercent={(percent) => selection && setSelection({ ...selection, percent })}
            onReview={() => ready && setReviewing(true)}
            open={panelOpen}
            onClose={() => setPanelOpen(false)}
          />
        </div>
      </div>

      {slot && !panelOpen && (
        <div className="pickbar">
          <div>
            <b>{formatHour(slot.hour)}</b>
            <span>{dayLabel(day)}</span>
          </div>
          <Button onClick={() => setPanelOpen(true)}>Continuar</Button>
        </div>
      )}

      {reviewing && selection && slot && (
        <ReviewDialog
          space={space}
          day={day}
          hour={selection.hour}
          percent={slot.kind === 'free' ? null : selection.percent}
          booking={booking}
          onConfirm={confirm}
          onChange={() => setReviewing(false)}
        />
      )}
    </>
  );
}

export function SpaceDetailPage() {
  const { spaceId } = useParams();
  const space = SPACES.find((s) => s.id === spaceId);
  if (!space) return <Navigate to={paths.explore} replace />;
  // La clave reinicia la selección al cambiar de espacio.
  return <SpaceDetail key={space.id} space={space} />;
}
