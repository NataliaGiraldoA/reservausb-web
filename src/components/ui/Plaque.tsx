import './Plaque.css';
import type { Space } from '@/domain/types';

interface Props {
  space: Pick<Space, 'code' | 'type'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/** Placa de puerta con el código del espacio, de color según su tipo. */
export function Plaque({ space, size = 'md' }: Props) {
  const sizeClass = size === 'md' ? '' : ` plaque--${size}`;
  return <span className={`plaque plaque--${space.type}${sizeClass}`}>{space.code}</span>;
}
