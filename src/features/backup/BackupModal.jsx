import React, { useState } from 'react';
import { Download, Upload, ShieldCheck, Database, XCircle } from 'lucide-react';
import { exportAllData, importData } from '../../storage/db';

export default function BackupModal({ isOpen, onClose, onDataRestored }) {
  const [importStatus, setImportStatus] = useState(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    await exportAllData();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const res = await importData(content);
      if (res.success) {
        setImportStatus({ type: 'success', message: '¡Datos restaurados con éxito!' });
        if (onDataRestored) onDataRestored();
      } else {
        setImportStatus({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
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
            <strong>100% Privado & Local-First:</strong> Todas tus rutinas y registros de entrenamientos se guardan en la base de datos de tu navegador (IndexedDB). No viajan a ningún servidor externo.
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
        </div>
      </div>
    </div>
  );
}
