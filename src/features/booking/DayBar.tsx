import { DAYS } from '@/domain/constants';

interface Props {
  day: number;
  onChange: (day: number) => void;
}

/** Hoy y los 6 días siguientes. */
export function DayBar({ day, onChange }: Props) {
  return (
    <div className="daybar" role="group" aria-label="Día">
      {DAYS.map((info, index) => (
        <button
          key={info.date}
          type="button"
          className="day"
          aria-pressed={day === index}
          aria-label={info.label}
          onClick={() => onChange(index)}
        >
          {info.short}
          <b>{info.date}</b>
        </button>
      ))}
    </div>
  );
}
