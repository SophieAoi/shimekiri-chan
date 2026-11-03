import { useId, useLayoutEffect, useRef, type ReactNode, type SyntheticEvent } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Wraps the native <dialog>, which provides the focus trap, Esc handling and inert
 * background for free. Clicking the backdrop does not close it, so a stray tap can't
 * throw away a half-filled form.
 */
export function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // A layout effect closes before removal, which lets the browser restore focus.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const onCancel = (event: SyntheticEvent) => {
    event.preventDefault();
    onClose();
  };

  return (
    <dialog ref={dialogRef} className={styles.modal} aria-labelledby={titleId} onCancel={onCancel}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {children}
    </dialog>
  );
}
