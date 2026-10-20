import './profile.css';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { paths } from '@/app/paths';
import { Alert, Button, Icon, useToast } from '@/components/ui';
import { formatDecimal } from '@/domain/format';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { sessionUser, totalPoints, useActions, useAppState } from '@/store';

function GradeForm() {
  const state = useAppState();
  const actions = useActions();
  const toast = useToast();
  const saved = state.session ? state.grades[state.session] : null;
  const [draft, setDraft] = useState(saved === null ? '' : formatDecimal(saved));
  const [error, setError] = useState('');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = actions.saveGrade(draft);
    if (result.ok) {
      setError('');
      setDraft(formatDecimal(result.value));
      toast.show('Promedio guardado. Ya cuentas para el top.');
    } else {
      setError(result.message);
    }
  };

  return (
    <>
      {error && <Alert id="grade-error">{error}</Alert>}
      <form className="inline" onSubmit={onSubmit} noValidate>
        <label className="sr" htmlFor="grade">
          Promedio de notas
        </label>
        <input
          className={`input${error ? ' err' : ''}`}
          id="grade"
          inputMode="decimal"
          placeholder="Ej.: 4,2"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'grade-error' : undefined}
        />
        <Button type="submit">Guardar</Button>
      </form>
    </>
  );
}

export function ProfilePage() {
  useDocumentTitle('Perfil');
  const state = useAppState();
  const actions = useActions();
  const user = sessionUser(state);
  if (!user) return null;

  const points = totalPoints(state, user.id);
  const history = [...state.points[user.id]].reverse();
  const grade = state.grades[user.id];

  return (
    <div className="wrap page">
      <div className="me-h">
        <span className="avatar avatar--lg">{user.firstName.slice(0, 2).toUpperCase()}</span>
        <div>
          <h1 className="h1">{user.name}</h1>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="cols cols--even">
        <div>
          <div className="panel panel--night" style={{ marginBottom: 16 }}>
            <div className="bignum" style={{ color: 'var(--on-night)' }}>
              {points} puntos
            </div>
            <p style={{ color: 'var(--on-night-muted)', marginTop: 10, maxWidth: '46ch' }}>
              Bonificación por compartir espacios que se usan. Quien reservó primero recibe mucho
              más que quien se une. Valen el 30% de tu índice en el top.
            </p>
          </div>
          <div className="panel">
            <h2 className="panel__t">Historial de puntos</h2>
            {history.length ? (
              history.map((entry, index) => (
                <div className="plog" key={`${entry.text}-${index}`}>
                  <div>
                    {entry.text}
                    <span>{entry.date}</span>
                  </div>
                  <b>+{entry.points}</b>
                </div>
              ))
            ) : (
              <p className="muted">
                Aún no tienes puntos. Libera parte de un espacio que reservaste o toma una parte
                liberada; cuando todos hagan check-in, recibes la bonificación.
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="panel">
            <h2 className="panel__t">Mi promedio de notas</h2>
            <p className="muted small" style={{ marginBottom: 14 }}>
              Escala de 0,0 a 5,0. Vale el 35% de tu índice.
            </p>
            <GradeForm key={user.id} />
            <div className="metrics">
              <div>
                <b>{grade === null ? 'Sin dato' : formatDecimal(grade)}</b>
                <span>Promedio</span>
              </div>
              <div>
                <b>{state.hours[user.id]} h</b>
                <span>Horas de uso</span>
              </div>
              <div>
                <b>{points}</b>
                <span>Puntos</span>
              </div>
            </div>
          </div>

          <div className="menu" style={{ marginTop: 16 }}>
            <Link to={paths.top}>
              Ver el top de estudiantes
              <Icon name="chev" size={18} />
            </Link>
            <Link to={paths.report()}>
              Reportar un daño
              <Icon name="chev" size={18} />
            </Link>
            <button type="button" onClick={actions.logout}>
              Cerrar sesión
              <Icon name="out" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
