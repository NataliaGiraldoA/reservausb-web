import './landing.css';
import { paths } from '@/app/paths';
import { ButtonLink, Icon } from '@/components/ui';
import { SpaceDirectory } from '@/components/SpaceDirectory/SpaceDirectory';
import { POINTS_JOINER, POINTS_OWNER, SPACES } from '@/domain/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Hero } from './Hero';
import { ShareDemo } from './ShareDemo';

const STEPS = [
  [
    'Elige una hora',
    'Cada franja muestra qué parte del espacio sigue libre, para que no llegues a una sala llena.',
  ],
  [
    'Reserva o toma una parte',
    'Quien llega primero reserva todo. Los demás pueden tomar 25%, 50% o 75% de lo que se libere.',
  ],
  [
    'Haz check-in con el QR',
    'Escanea el código de la puerta desde 10 minutos antes. Si no llegas a tiempo, la reserva se libera.',
  ],
  [
    'Suma puntos',
    `Cuando un espacio compartido se usa, quien lo liberó gana ${POINTS_OWNER} puntos y quien lo tomó, ${POINTS_JOINER}.`,
  ],
] as const;

const FEATURES = [
  [
    'qr',
    'Check-in en la puerta',
    'Cada espacio tiene su QR. Escanearlo confirma tu llegada y suma una hora de uso a tu historial.',
  ],
  [
    'tool',
    'Reporta un daño',
    'Si algo está dañado, avísalo desde tu perfil. Al enviar el reporte recibes un número de seguimiento.',
  ],
  [
    'trophy',
    'Top de estudiantes',
    'Un índice de 0 a 100 que pesa tus puntos, tu promedio de notas y tus horas de uso. De los demás solo ves el índice.',
  ],
] as const;

export function LandingPage() {
  useDocumentTitle('Reserva y comparte los espacios del campus');

  return (
    <>
      <Hero />

      <section className="section" id="como-funciona">
        <div className="wrap">
          <div className="section__head">
            <h2 className="h2">De la reserva a los puntos, en cuatro pasos</h2>
          </div>
          <ol className="steps">
            {STEPS.map(([title, text], index) => (
              <li key={title}>
                <span className="n">{index + 1}</span>
                <h3 className="h3">{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="compartir">
        <div className="wrap share">
          <div>
            <h2 className="h2">Si reservas más espacio del que vas a usar, libera una parte</h2>
            <p className="lead" style={{ marginTop: 18 }}>
              Reservaste la sala para ocho y van a ser cuatro. Libera el resto y otro estudiante lo
              toma. Si todos hacen check-in, los dos ganan puntos.
            </p>
          </div>
          <ShareDemo />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <ul className="feats">
            {FEATURES.map(([icon, title, text]) => (
              <li key={title}>
                <Icon name={icon} size={30} strokeWidth={1.7} />
                <h3 className="h3">{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="espacios">
        <div className="wrap">
          <div className="section__head">
            <h2 className="h2">Siete espacios en tres tipos</h2>
            <p className="lead">La ocupación de hoy, hora por hora. Inicia sesión para reservar.</p>
          </div>
          <SpaceDirectory spaces={SPACES} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="band">
            <div>
              <h2 className="h2">Entra con tu correo institucional</h2>
              <p>
                Reserva tu primera franja en menos de un minuto. Si no vas a usar todo el espacio,
                libera una parte.
              </p>
            </div>
            <ButtonLink size="lg" to={paths.login}>
              Iniciar sesión
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
