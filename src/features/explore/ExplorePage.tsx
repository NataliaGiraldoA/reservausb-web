import './explore.css';
import { useSearchParams } from 'react-router-dom';
import { SpaceDirectory } from '@/components/SpaceDirectory/SpaceDirectory';
import {
  NOW,
  SPACES,
  SPACE_FILTERS,
  SPACE_FILTER_LABELS,
  type SpaceFilter,
} from '@/domain/constants';
import { formatClock } from '@/domain/format';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { sessionUser, useAppState } from '@/store';

function parseFilter(value: string | null): SpaceFilter {
  return SPACE_FILTERS.find((filter) => filter === value) ?? 'todos';
}

export function ExplorePage() {
  useDocumentTitle('Explorar espacios');
  const user = sessionUser(useAppState());
  const [params, setParams] = useSearchParams();
  const filter = parseFilter(params.get('tipo'));

  const visible = SPACES.filter((space) => filter === 'todos' || space.type === filter);
  const countOf = (f: SpaceFilter) =>
    f === 'todos' ? SPACES.length : SPACES.filter((s) => s.type === f).length;

  return (
    <div className="wrap page">
      <header className="pagehead">
        <div>
          <p className="kicker">Hoy, lunes 28 de septiembre, {formatClock(NOW.hour, NOW.minute)}</p>
          <h1 className="h1">Hola, {user?.firstName}. ¿Qué necesitas reservar?</h1>
        </div>
      </header>

      <div className="toolbar">
        <div className="tabs" role="group" aria-label="Filtrar por tipo">
          {SPACE_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className="tab"
              aria-pressed={filter === f}
              onClick={() => setParams(f === 'todos' ? {} : { tipo: f }, { replace: true })}
            >
              {SPACE_FILTER_LABELS[f]}
              <small>{countOf(f)}</small>
            </button>
          ))}
        </div>
      </div>

      <SpaceDirectory spaces={visible} />
    </div>
  );
}
