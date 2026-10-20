import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export interface Crumb {
  label: string;
  /** Sin `to`, es la página actual. */
  to?: string;
}

export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Ruta">
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 && <Icon name="chev" size={14} />}
          {item.to ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
