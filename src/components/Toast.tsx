import { useEffect } from 'react';
import { TOAST_DURATION_MS } from '../constants';
import { useTracker } from '../state/TrackerContext';
import styles from './Toast.module.css';

export function Toast() {
  const { toast, dismissToast } = useTracker();
  const toastId = toast?.id;

  // Keyed on the id so a new toast restarts the timer while this stays mounted.
  useEffect(() => {
    if (!toastId) return;
    const timer = setTimeout(dismissToast, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastId, dismissToast]);

  const onUndo = () => {
    toast?.undo?.();
    dismissToast();
  };

  return (
    <div className={styles.region} role="status">
      {toast && (
        <div className={styles.toast}>
          <span className={styles.message}>{toast.message}</span>
          {toast.undo && (
            <button className={styles.undo} type="button" onClick={onUndo}>
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
