interface Props {
  size?: number;
}

/** Marca de ReservaUSB: tres barras de ocupación sobre fondo naranja. */
export function BrandMark({ size = 34 }: Props) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="9" fill="#E8731A" />
      <rect x="7.5" y="15" width="4.6" height="11.5" rx="1.3" fill="#141B2D" />
      <rect x="14.7" y="8" width="4.6" height="18.5" rx="1.3" fill="#141B2D" />
      <rect x="21.9" y="12" width="4.6" height="14.5" rx="1.3" fill="#141B2D" />
    </svg>
  );
}
