import './Dots.css';

export interface DotSegment {
  /** `taken`: ocupado por otros. `mine`: la parte de la persona. */
  kind: 'taken' | 'mine';
  count: number;
}

interface Props {
  capacity: number;
  segments: readonly DotSegment[];
  large?: boolean;
  className?: string;
}

const KIND_CLASS = { taken: 'dot--t', mine: 'dot--m' } as const;

/** Un punto por persona de la capacidad. Los que no pertenecen a ningún tramo quedan libres. */
export function Dots({ capacity, segments, large, className }: Props) {
  const dots: string[] = [];
  for (const segment of segments) {
    for (let k = 0; k < segment.count && dots.length < capacity; k += 1) {
      dots.push(KIND_CLASS[segment.kind]);
    }
  }
  while (dots.length < capacity) dots.push('');

  return (
    <div
      className={`dots${large ? ' dots--lg' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {dots.map((kind, index) => (
        <i key={index} className={`dot ${kind}`.trim()} />
      ))}
    </div>
  );
}
