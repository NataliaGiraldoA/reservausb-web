/** Clases de un botón. Se comparte entre `<Button>` y `<ButtonLink>`. */
type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface StyleProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
}

export function buttonClass({
  variant = 'primary',
  size = 'md',
  block,
  className,
}: StyleProps): string {
  return [
    'btn',
    variant !== 'primary' && `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}
