import './ranking.css';
import { paths } from '@/app/paths';
import { ButtonLink, Meter } from '@/components/ui';
import { INDEX_WEIGHTS } from '@/domain/constants';
import { formatDecimal } from '@/domain/format';
import { contributions } from '@/domain/ranking';
import type { RankedStudent, Ranking } from '@/domain/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ranking, useAppState } from '@/store';

const TOP_SIZE = 10;

function Podium({ top, me }: { top: readonly RankedStudent[]; me: string | null }) {
  // Segundo, primero y tercero, en ese orden visual.
  const order = [top[1], top[0], top[2]].filter((s): s is RankedStudent => Boolean(s));
  return (
    <div className="podium">
      {order.map((student) => {
        const mine = student.userId !== null && student.userId === me;
        return (
          <div
            key={student.name}
            className={`pod pod--${student.position}${mine ? ' pod--me' : ''}`}
          >
            <div className="pos">{student.position}</div>
            <div>
              <b>
                {student.name}
                {mine && ' (tú)'}
              </b>
              <span>Índice {formatDecimal(student.index)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MyPosition({ mine, data }: { mine: RankedStudent; data: Ranking }) {
  if (mine.position === null) {
    return (
      <div className="panel">
        <h2 className="panel__t">Aún no estás en el top</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Registra tu promedio de notas en tu perfil para que se calcule tu índice.
        </p>
        <ButtonLink size="sm" to={paths.profile}>
          Registrar mi promedio
        </ButtonLink>
      </div>
    );
  }

  const details: Record<string, string> = {
    points: `${mine.points} de ${data.maxPoints} (el más alto)`,
    grade: `${formatDecimal(mine.grade ?? 0)} de 5,0`,
    hours: `${mine.hours} h de ${data.maxHours} h (el más alto)`,
  };

  return (
    <div className="panel panel--night">
      <div className="big-idx">
        <div className="bignum">#{mine.position}</div>
        <span>
          {formatDecimal(mine.index)}
          <small> / 100</small>
        </span>
      </div>
      <p style={{ color: 'var(--on-night-muted)', marginTop: 6, fontSize: 14.5 }}>
        Tu índice y lo que aporta cada métrica
      </p>
      {contributions(mine).map((part) => (
        <div className="bd" key={part.key}>
          <div className="bd__h">
            <span>
              {part.label} ({Math.round(part.weight * 100)}%)
            </span>
            <b>+{formatDecimal(part.value)}</b>
          </div>
          <Meter percent={Math.round(part.ratio * 100)} />
          <small>{details[part.key]}</small>
        </div>
      ))}
    </div>
  );
}

export function TopPage() {
  useDocumentTitle('Top de estudiantes');
  const state = useAppState();
  const data = ranking(state);
  const top = data.ranked.slice(0, TOP_SIZE);
  const mine = data.all.find((s) => s.userId === state.session);

  return (
    <div className="wrap page">
      <header className="pagehead">
        <div>
          <p className="kicker">
            Índice = {Math.round(INDEX_WEIGHTS.points * 100)}% puntos +{' '}
            {Math.round(INDEX_WEIGHTS.grade * 100)}% promedio +{' '}
            {Math.round(INDEX_WEIGHTS.hours * 100)}% horas de uso
          </p>
          <h1 className="h1">Top de estudiantes</h1>
        </div>
      </header>

      <div className="cols">
        <div>
          <Podium top={top} me={state.session} />
          <ol className="rank">
            {top.map((student) => {
              const isMe = student.userId !== null && student.userId === state.session;
              return (
                <li key={student.name} className={isMe ? 'me' : undefined}>
                  <span
                    className="pos"
                    style={student.position! <= 3 ? { color: 'var(--orange-ink)' } : undefined}
                  >
                    {student.position}
                  </span>
                  <span className="nm">
                    {student.name}
                    {isMe && ' (tú)'}
                    <small>Índice {formatDecimal(student.index)}</small>
                  </span>
                  <Meter
                    percent={student.index}
                    label={`Índice ${formatDecimal(student.index)} de 100`}
                  />
                </li>
              );
            })}
          </ol>
          <p className="muted small" style={{ marginTop: 14 }}>
            Por privacidad, de los demás solo ves el índice. Tu promedio, horas y puntos solo los
            ves tú.
          </p>
        </div>

        <aside className="sticky">{mine && <MyPosition mine={mine} data={data} />}</aside>
      </div>
    </div>
  );
}
