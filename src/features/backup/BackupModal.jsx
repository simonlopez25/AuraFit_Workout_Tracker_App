import React, { useState, useEffect } from 'react';
import { Download, Upload, ShieldCheck, Database, XCircle, Trash2, RotateCcw, Archive } from 'lucide-react';
import { exportAllData, importData } from '../../storage/db';
import {
  getTrash,
  restoreFromTrash,
  purgeFromTrash,
  purgeAllTrash,
  createSnapshot,
  refreshMirror,
  onDataChanged
} from '../../storage/backups';

export default function BackupModal({ isOpen, onClose, onDataRestored }) {
  const [importStatus, setImportStatus] = useState(null);
  const [trash, setTrash] = useState({ routines: [], workouts: [] });
  const [trashBusy, setTrashBusy] = useState(false);

  const loadTrash = async () => {
    setTrash(await getTrash());
  };

  useEffect(() => {
    if (isOpen) {
      loadTrash();
      return onDataChanged(loadTrash);
    }
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = async () => {
    await exportAllData();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Permitir re-seleccionar el mismo archivo en el futuro
    e.target.value = '';

    let content;
    try {
      content = await file.text();
    } catch (err) {
      setImportStatus({ type: 'error', message: 'No se pudo leer el archivo.' });
      return;
    }

    // 1) Validar formato ANTES de tocar la base de datos
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      setImportStatus({ type: 'error', message: 'El archivo no es un JSON válido.' });
      return;
    }
    if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
      setImportStatus({ type: 'error', message: 'Formato de backup inválido.' });
      return;
    }

    const incomingCount = ['routines', 'workouts'].reduce(
      (acc, key) => acc + (Array.isArray(parsed.data[key]) ? parsed.data[key].length : 0),
      0
    );
    if (incomingCount === 0) {
      setImportStatus({ type: 'error', message: 'Este archivo no contiene rutinas ni historial.' });
      return;
    }

    // 2) Confirmación explícita: esto REEMPLAZA los datos actuales
    const confirmed = confirm(
      '⚠️ Restaurar este archivo REEMPLAZARÁ todos tus datos actuales (rutinas, historial y configuración) por los del archivo.\n\n' +
      'Se guardará un respaldo automático previo. ¿Continuar?'
    );
    if (!confirmed) return;

    // 3) Respaldo automático previo a la importación
    await createSnapshot('antes-de-importar');

    // 4) Importar
    const res = await importData(content);
    if (res.success) {
      await refreshMirror();
      setImportStatus({ type: 'success', message: '¡Datos restaurados con éxito!' });
      if (onDataRestored) onDataRestored();
    } else {
      setImportStatus({ type: 'error', message: res.message });
    }
  };

  // --- Papelera -------------------------------------------------------------

  const handleRestoreTrash = async (type, id) => {
    if (trashBusy) return;
    setTrashBusy(true);
    try {
      await restoreFromTrash(type, id);
      await loadTrash();
      setImportStatus({ type: 'success', message: 'Elemento restaurado correctamente.' });
    } catch (err) {
      console.error('Error restaurando de papelera:', err);
      setImportStatus({ type: 'error', message: 'No se pudo restaurar el elemento.' });
    } finally {
      setTrashBusy(false);
    }
  };

  const handlePurgeTrash = async (type, id, label) => {
    if (trashBusy) return;
    if (!confirm(`¿Eliminar DEFINITIVAMENTE "${label}"? Esta acción no se puede deshacer.`)) return;
    setTrashBusy(true);
    try {
      await purgeFromTrash(type, id);
      await loadTrash();
      setImportStatus({ type: 'success', message: 'Elemento eliminado definitivamente.' });
    } catch (err) {
      console.error('Error purgando de papelera:', err);
      setImportStatus({ type: 'error', message: 'No se pudo eliminar el elemento.' });
    } finally {
      setTrashBusy(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (trashBusy) return;
    if (!confirm('¿Vaciar TODA la papelera? Los elementos se eliminarán definitivamente.')) return;
    setTrashBusy(true);
    try {
      await purgeAllTrash();
      await loadTrash();
      setImportStatus({ type: 'success', message: 'Papelera vaciada.' });
    } catch (err) {
      console.error('Error vaciando papelera:', err);
      setImportStatus({ type: 'error', message: 'No se pudo vaciar la papelera.' });
    } finally {
      setTrashBusy(false);
    }
  };

  const trashTotal = trash.routines.length + trash.workouts.length;

  const trashItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)'
  };

  const smallBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'none',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: 700,
    padding: '6px 10px',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="var(--bronze-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Copia de Seguridad & Privacidad</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <XCircle size={22} />
          </button>
        </div>

        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '18px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <ShieldCheck size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.4' }}>
            <strong>100% Privado & Local-First:</strong> Tus datos se guardan en tu navegador
            (IndexedDB) con <strong>respaldos automáticos internos</strong> y nunca se borran solos.
            Descarga el .json y guárdalo en tu nube para tener una red de seguridad externa.
          </p>
        </div>

        {importStatus && (
          <div style={{
            background: importStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${importStatus.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
            color: importStatus.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            {importStatus.message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Exportar Copia</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Descarga un archivo JSON con todas tus rutinas, sesiones y configuraciones para guardarlo en tu móvil, Google Drive o pasar a otro dispositivo.
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExport}
              style={{ width: '100%' }}
            >
              <Download size={16} /> Descargar Backup (.JSON)
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Restaurar Copia</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Carga un archivo de respaldo previo para restaurar todas tus rutinas e historial.
              Se pedirá confirmación y se guardará un respaldo previo.
            </p>
            <label
              className="btn-secondary"
              style={{ width: '100%', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
            >
              <Upload size={16} /> Seleccionar archivo JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

          {/* Papelera */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Archive size={15} color="var(--bronze-primary)" /> Papelera
              </h4>
              {trashTotal > 0 && (
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  disabled={trashBusy}
                  style={{ ...smallBtnStyle, borderColor: 'rgba(244, 63, 94, 0.4)', color: 'var(--accent-rose)' }}
                >
                  <Trash2 size={12} /> Vaciar papelera
                </button>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Rutinas y registros eliminados aquí se conservan hasta que los vacíes: puedes restaurarlos cuando quieras.
            </p>

            {trashTotal === 0 ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '12px',
                background: 'var(--bg-surface-elevated)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}>
                La papelera está vacía.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {trash.routines.map((r) => (
                  <div key={`tr_${r.id}`} style={trashItemStyle}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Rutina · eliminada {r.deletedAt ? new Date(r.deletedAt).toLocaleDateString('es-ES') : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button type="button" style={smallBtnStyle} disabled={trashBusy} onClick={() => handleRestoreTrash('routine', r.id)}>
                        <RotateCcw size={12} /> Restaurar
                      </button>
                      <button
                        type="button"
                        disabled={trashBusy}
                        onClick={() => handlePurgeTrash('routine', r.id, r.name)}
                        style={{ ...smallBtnStyle, color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {trash.workouts.map((w) => (
                  <div key={`tw_${w.id}`} style={trashItemStyle}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {w.routineName || 'Entrenamiento'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Sesión {w.date || ''} · eliminada {w.deletedAt ? new Date(w.deletedAt).toLocaleDateString('es-ES') : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button type="button" style={smallBtnStyle} disabled={trashBusy} onClick={() => handleRestoreTrash('workout', w.id)}>
                        <RotateCcw size={12} /> Restaurar
                      </button>
                      <button
                        type="button"
                        disabled={trashBusy}
                        onClick={() => handlePurgeTrash('workout', w.id, `${w.routineName || 'Entrenamiento'} (${w.date || ''})`)}
                        style={{ ...smallBtnStyle, color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
