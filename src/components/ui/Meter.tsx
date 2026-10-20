interface Props {
  /** De 0 a 100. */
  percent: number;
  label?: string;
}

export function Meter({ percent, label }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="meter"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <i style={{ width: `${clamped}%` }} />
    </div>
  );
}
