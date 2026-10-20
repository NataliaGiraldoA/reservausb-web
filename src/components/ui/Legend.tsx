import './Strip.css';

interface Props {
  /** Incluye "Próxima hora" (solo tiene sentido en la vista de hoy). */
  showNext?: boolean;
}

export function Legend({ showNext = true }: Props) {
  return (
    <div className="legend">
      <span>
        <i className="lg-cupo" />
        Cupo
      </span>
      <span>
        <i className="lg-occ" />
        Ocupado
      </span>
      {showNext && (
        <span>
          <i className="lg-next" />
          Próxima hora
        </span>
      )}
      <span>
        <i className="lg-past" />
        Ya pasó
      </span>
    </div>
  );
}
