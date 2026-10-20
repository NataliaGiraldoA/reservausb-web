import { NOW } from '@/domain/constants';
import { formatClock } from '@/domain/format';
import { BrandMark } from '@/components/ui';

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr__in">
        <div>
          <div className="logo">
            <BrandMark size={28} />
            ReservaUSB
          </div>
          <p>
            Reserva y comparte salas de estudio, canchas y laboratorios de la Universidad de San
            Buenaventura Cali.
          </p>
        </div>
        <div className="ftr__demo">
          <b>Prototipo navegable.</b> La hora simulada es lunes 28 de septiembre,{' '}
          {formatClock(NOW.hour, NOW.minute)} Los datos se reinician al recargar la página.
        </div>
      </div>
    </footer>
  );
}
