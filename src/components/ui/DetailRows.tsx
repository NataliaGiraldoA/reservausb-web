import type { ReactNode } from 'react';

interface Props {
  rows: ReadonlyArray<readonly [label: string, value: ReactNode]>;
  className?: string;
  style?: React.CSSProperties;
}

/** Lista de pares etiqueta y valor. */
export function DetailRows({ rows, className, style }: Props) {
  return (
    <div className={`rows${className ? ` ${className}` : ''}`} style={style}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}
