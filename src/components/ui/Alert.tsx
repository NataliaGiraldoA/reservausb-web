import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface Props {
  id?: string;
  children: ReactNode;
}

/** Mensaje de error de un formulario. Se anuncia a los lectores de pantalla al aparecer. */
export function Alert({ id, children }: Props) {
  return (
    <div className="alert" role="alert" id={id}>
      <Icon name="warn" size={18} />
      <span>{children}</span>
    </div>
  );
}
