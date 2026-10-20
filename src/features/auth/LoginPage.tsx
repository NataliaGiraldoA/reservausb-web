import './auth.css';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { paths } from '@/app/paths';
import { Alert, Button, Plaque } from '@/components/ui';
import { DEMO_PASSWORD, SPACES, USERS } from '@/domain/constants';
import type { LoginField } from '@/domain/validators';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useActions, useAppState } from '@/store';

interface FormError {
  field: LoginField;
  message: string;
}

function plaqueOf(id: string) {
  return SPACES.find((space) => space.id === id)!;
}

export function LoginPage() {
  useDocumentTitle('Iniciar sesión');
  const { session } = useAppState();
  const actions = useActions();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<FormError | null>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!error) return;
    (error.field === 'email' ? emailInput : passwordInput).current?.focus();
  }, [error]);

  if (session) return <Navigate to={from ?? paths.explore} replace />;

  const signIn = (nextEmail: string, nextPassword: string) => {
    const result = actions.login(nextEmail, nextPassword);
    // Con la sesión iniciada, la página redirige sola a la ruta pedida.
    if (result.ok) return;
    // Se conserva el correo escrito; la contraseña se vuelve a pedir.
    setError({ field: result.field, message: result.message });
    setPassword('');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    signIn(email, password);
  };

  return (
    <section className="auth">
      <div className="auth__aside">
        <div className="auth__plaques">
          <Plaque space={plaqueOf('b204')} size="lg" />
          <Plaque space={plaqueOf('can1')} size="lg" />
          <Plaque space={plaqueOf('l101')} size="lg" />
        </div>
        <div>
          <h2>Un solo lugar para todos los espacios del campus</h2>
          <p>
            Reserva, comparte lo que no uses y suma puntos cuando un espacio se aprovecha entre
            varios.
          </p>
        </div>
      </div>

      <div className="auth__main">
        <div className="auth__box">
          <h1 className="h1">Inicia sesión</h1>
          <p>Usa tu correo institucional de la USB Cali.</p>

          <form onSubmit={onSubmit} noValidate>
            {error && <Alert id="login-error">{error.message}</Alert>}
            <div className="field">
              <label htmlFor="email">Correo institucional</label>
              <input
                ref={emailInput}
                className={`input${error?.field === 'email' ? ' err' : ''}`}
                id="email"
                type="email"
                autoComplete="username"
                placeholder="nombre@correo.usbcali.edu.co"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={error?.field === 'email' || undefined}
                aria-describedby={error?.field === 'email' ? 'login-error' : undefined}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                ref={passwordInput}
                className={`input${error?.field === 'password' ? ' err' : ''}`}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={error?.field === 'password' || undefined}
                aria-describedby={error?.field === 'password' ? 'login-error' : undefined}
              />
            </div>
            <Button type="submit" size="lg" block>
              Iniciar sesión
            </Button>
          </form>

          <details className="demo" open>
            <summary>Cuentas de prueba</summary>
            <p>
              Contraseña de ambas: <b>{DEMO_PASSWORD}</b>. Las dos cuentas comparten los mismos
              datos, así que puedes ver cómo cambian reservas y puntos cuando dos estudiantes
              comparten un espacio.
            </p>
            <div className="btns">
              {Object.values(USERS).map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => signIn(user.email, DEMO_PASSWORD)}
                >
                  Entrar como {user.firstName}
                </Button>
              ))}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
