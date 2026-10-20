import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  title: string;
  /** Texto de apoyo bajo el título. */
  description?: ReactNode;
  /** `alertdialog` para confirmaciones que piden decidir. */
  role?: 'dialog' | 'alertdialog';
  onClose: () => void;
  /** Elemento que recibe el foco al abrir. Por defecto, el primer control. */
  initialFocus?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

const FOCUSABLE =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal accesible: mueve el foco al abrir, lo mantiene dentro con Tab, se cierra con
 * Escape o al pulsar fuera, y devuelve el foco a quien lo abrió.
 */
export function Dialog({
  title,
  description,
  role = 'dialog',
  onClose,
  initialFocus,
  children,
}: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const target = initialFocus?.current ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      opener?.focus?.({ preventScroll: true });
    };
    // El foco inicial solo se decide al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      className="modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        className="dialog"
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <h3 id={titleId}>{title}</h3>
        {description && <p id={descriptionId}>{description}</p>}
        {children}
      </div>
    </div>,
    document.body,
  );
}
