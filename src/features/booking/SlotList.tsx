import { peopleFor } from '@/domain/availability';
import type { SlotState } from '@/domain/availability';
import { HOURS } from '@/domain/constants';
import { formatHour, formatPeople } from '@/domain/format';
import type { Space } from '@/domain/types';

interface Props {
  space: Space;
  slots: readonly SlotState[];
  selectedHour: number | null;
  /** Porcentaje que la persona tomaría de la franja elegida. */
  selectedPercent: number;
  onSelect: (hour: number) => void;
}

function stateLabel(slot: SlotState, selected: boolean): string {
  if (slot.kind === 'mine') return 'Tu reserva';
  if (selected) return 'Seleccionada';
  if (slot.kind === 'full') return 'Llena';
  if (slot.kind === 'free') return 'Libre';
  return `${slot.available}% liberado`;
}

/** Agenda del día: una fila por franja. Las llenas, las propias y las que ya pasaron no se eligen. */
export function SlotList({ space, slots, selectedHour, selectedPercent, onSelect }: Props) {
  const past = slots.filter((slot) => slot.kind === 'past');
  const upcoming = slots.filter((slot) => slot.kind !== 'past');
  const lastPast = past[past.length - 1];

  return (
    <ul className="agenda">
      {lastPast && (
        <li>
          <div className="pastnote">
            <i />
            Las franjas de {formatHour(HOURS[0]!)} a {formatHour(lastPast.hour + 1)} ya pasaron.
          </div>
        </li>
      )}
      {upcoming.map((slot) => {
        const selected = selectedHour === slot.hour;
        const disabled = slot.kind === 'full' || slot.kind === 'mine';
        const showDetail = !disabled && !selected;
        const portion = selected ? (slot.kind === 'free' ? 100 : selectedPercent) : 0;
        const className = `slotrow${slot.kind === 'full' ? ' full' : ''}${slot.kind === 'mine' ? ' mine' : ''}`;
        return (
          <li key={slot.hour}>
            <button
              type="button"
              className={className}
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onSelect(slot.hour)}
            >
              <span className="slotrow__time">{formatHour(slot.hour)}</span>
              <span
                className="slotrow__bar"
                style={{ '--o': `${slot.occupied}%`, '--p': `${portion}%` } as React.CSSProperties}
              />
              <span className="slotrow__state">
                <b>{stateLabel(slot, selected)}</b>
                {showDetail && (
                  <small>cupo para {formatPeople(peopleFor(space, slot.available))}</small>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
