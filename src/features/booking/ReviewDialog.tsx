import { useRef } from 'react';
import { Button, DetailRows, Dialog } from '@/components/ui';
import { peopleFor } from '@/domain/availability';
import { dayFullLabel } from '@/domain/describe';
import { formatPeople, formatRange } from '@/domain/format';
import { ownerLabel } from '@/domain/reservations';
import type { Booking, SharePercent, Space } from '@/domain/types';

interface Props {
  space: Space;
  day: number;
  hour: number;
  /** `null` cuando reserva el espacio completo. */
  percent: SharePercent | null;
  booking: Booking | undefined;
  onConfirm: () => void;
  onChange: () => void;
}

/** Resumen previo a confirmar: espacio, fecha, hora, parte reservada y con quién se comparte. */
export function ReviewDialog({ space, day, hour, percent, booking, onConfirm, onChange }: Props) {
  const confirm = useRef<HTMLButtonElement>(null);
  const rows: Array<[string, string]> = [
    ['Espacio', space.name],
    ['Fecha', dayFullLabel(day)],
    ['Hora', formatRange(hour)],
    [
      'Tu parte',
      percent === null
        ? 'Espacio completo'
        : `${percent}% (${formatPeople(peopleFor(space, percent))})`,
    ],
  ];
  if (percent !== null) {
    rows.push([
      'Compartes con',
      booking?.owner && booking.owner !== 'anon'
        ? ownerLabel(booking.owner)
        : 'Quien reservó primero',
    ]);
  }

  return (
    <Dialog title="Revisa tu reserva" onClose={onChange} initialFocus={confirm}>
      <DetailRows rows={rows} style={{ marginBottom: 22 }} />
      <div className="stack">
        <button ref={confirm} type="button" className="btn" onClick={onConfirm}>
          Confirmar reserva
        </button>
        <Button variant="ghost" onClick={onChange}>
          Cambiar
        </Button>
      </div>
    </Dialog>
  );
}
