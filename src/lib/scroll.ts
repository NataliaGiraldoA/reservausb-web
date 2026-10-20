/** Desplaza la página hasta un elemento dejando espacio para la cabecera fija. */
export function scrollToId(id: string, offset = 72): void {
  const element = document.getElementById(id);
  if (!element) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
}
