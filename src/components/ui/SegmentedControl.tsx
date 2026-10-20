import type { ReactNode } from 'react';

interface Option<T extends string | number> {
  value: T;
  label: ReactNode;
}

interface Props<T extends string | number> {
  /** Id del texto que nombra el grupo. */
  labelledBy: string;
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}

/** Grupo de botones de selección única. */
export function SegmentedControl<T extends string | number>({
  labelledBy,
  options,
  value,
  onChange,
  className = 'seg',
}: Props<T>) {
  return (
    <div className={className} role="group" aria-labelledby={labelledBy}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
