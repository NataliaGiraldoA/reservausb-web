import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { buttonClass, type StyleProps } from './buttonClass';

type ButtonProps = StyleProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export function Button({ variant, size, block, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass({ variant, size, block, className })} {...rest} />
  );
}

type ButtonLinkProps = StyleProps & Omit<LinkProps, 'className'> & { children: ReactNode };

/** Enlace con aspecto de botón. */
export function ButtonLink({ variant, size, block, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass({ variant, size, block, className })} {...rest} />;
}
