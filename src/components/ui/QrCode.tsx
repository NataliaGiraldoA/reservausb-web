/** QR de ejemplo para la simulación del check-in. No codifica ningún dato. */
export function QrCode() {
  return (
    <svg className="qr" viewBox="0 0 21 21" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="21" height="21" fill="#fff" />
      <path
        fill="#141B2D"
        d="M1 1h7v7H1zM2 2v5h5V2zM3 3h3v3H3zM13 1h7v7h-7zM14 2v5h5V2zM15 3h3v3h-3zM1 13h7v7H1zM2 14v5h5v-5zM3 15h3v3H3zM9 1h1v1H9zM11 1h1v2h-1zM9 3h2v1H9zM10 5h1v2h-1zM9 7h1v2H9zM11 8h1v1h-1zM1 9h2v1H1zM4 9h1v2H4zM6 9h3v1H6zM10 9h3v1h-3zM14 9h1v2h-1zM16 9h2v1h-2zM19 9h1v2h-1zM2 11h1v1H2zM6 11h2v1H6zM9 11h1v2H9zM11 11h2v1h-2zM16 11h2v1h-2zM13 12h2v1h-2zM18 12h2v1h-2zM9 14h2v1H9zM12 13h1v3h-1zM14 14h2v1h-2zM17 14h1v2h-1zM19 14h1v1h-1zM10 16h1v2h-1zM13 17h3v1h-3zM18 17h2v1h-2zM9 19h2v1H9zM12 19h1v1h-1zM14 19h1v1h-1zM17 19h1v1h-1zM19 19h1v1h-1z"
      />
    </svg>
  );
}
