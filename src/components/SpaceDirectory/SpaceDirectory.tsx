import './SpaceDirectory.css';
import { Link } from 'react-router-dom';
import { paths } from '@/app/paths';
import { occupancy, slotsWithRoom } from '@/domain/availability';
import { NOW } from '@/domain/constants';
import { formatHourShort, pluralize, NBSP } from '@/domain/format';
import type { Space } from '@/domain/types';
import { Icon, Legend, Plaque, Strip } from '@/components/ui';
import { useAppState } from '@/store';

const NEXT_HOUR = NOW.hour + 1;

function Row({ space }: { space: Space }) {
  const { bookings } = useAppState();
  const occupied = occupancy(bookings, space.id, NOW.day, NEXT_HOUR);
  const withRoom = slotsWithRoom(bookings, space.id, NOW.day);

  return (
    <Link className="dirrow dircols" to={paths.space(space.id)}>
      <Plaque space={space} />
      <div>
        <h3>{space.name}</h3>
        <div className="meta">
          {space.where}, {space.capacity} personas
        </div>
      </div>
      <div className="strip-cell">
        <Strip space={space} />
      </div>
      <div className="occ">
        <span>
          <b>{occupied}%</b> ocupado
          <span className="when"> a las {formatHourShort(NEXT_HOUR)}</span>
        </span>
        <span className={`room${withRoom ? '' : ' none'}`}>
          {withRoom
            ? `${withRoom} ${pluralize(withRoom, 'franja', 'franjas')} con cupo hoy`
            : 'Sin cupo hoy'}
        </span>
      </div>
      <span className="chev">
        <Icon name="chev" size={18} />
      </span>
    </Link>
  );
}

interface Props {
  spaces: readonly Space[];
}

/** Tabla de espacios con su ocupación de hoy, hora por hora. */
export function SpaceDirectory({ spaces }: Props) {
  return (
    <div className="dir">
      <div className="dirhead dircols">
        <span />
        <span>Espacio</span>
        <span>
          <span>
            7{NBSP}a.{NBSP}m.
          </span>
          <span>
            8{NBSP}p.{NBSP}m.
          </span>
        </span>
        <span>A las {formatHourShort(NEXT_HOUR)}</span>
        <span />
      </div>
      {spaces.map((space) => (
        <Row key={space.id} space={space} />
      ))}
      <div className="dirfoot">
        <Legend />
      </div>
    </div>
  );
}
