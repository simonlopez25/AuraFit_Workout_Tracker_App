import React, { useEffect, useRef } from 'react';
import { XCircle } from 'lucide-react';

// Toast flotante con acción "Deshacer" — se usa tras eliminar rutinas/historial.
export default function UndoToast({ message, onUndo, onDismiss, duration = 8000 }) {
  const undoRef = useRef(onUndo);
  const dismissRef = useRef(onDismiss);
  undoRef.current = onUndo;
  dismissRef.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => dismissRef.current && dismissRef.current(), duration);
    return () => clearTimeout(timer);
    // Reinicia el temporizador solo cuando cambia el mensaje mostrado
  }, [message, duration]);

  return (
    <div className="undo-toast" role="status" aria-live="polite">
      <span className="undo-toast-msg">{message}</span>
      <button type="button" className="undo-toast-action" onClick={() => undoRef.current && undoRef.current()}>
        Deshacer
      </button>
      <button type="button" className="undo-toast-close" onClick={() => dismissRef.current && dismissRef.current()} aria-label="Cerrar">
        <XCircle size={16} />
      </button>
    </div>
  );
}
