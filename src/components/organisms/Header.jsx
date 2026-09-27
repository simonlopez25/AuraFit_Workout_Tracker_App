import React from 'react';
import { Database } from 'lucide-react';
import Logo from '../atoms/Logo';

export default function Header({ onOpenBackup, activeWorkoutDuration }) {
  const formatTime = (secs) => {
    if (!secs) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <Logo size={38} showGlow={true} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title font-heading">
              AURA<span style={{ fontWeight: 300, color: 'var(--bronze-light)' }}>FIT</span>
            </span>
            <span className="brand-badge">PRO</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
            Local-First &middot; 100% Offline
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {activeWorkoutDuration != null && (
          <div style={{
            background: 'rgba(217, 147, 90, 0.12)',
            border: '1px solid var(--bronze-primary)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 800,
            color: 'var(--bronze-light)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--bronze-primary)',
              animation: 'pulse 1.5s infinite'
            }} />
            <span className="tabular-nums">{formatTime(activeWorkoutDuration)}</span>
          </div>
        )}

        <button
          type="button"
          className="btn-icon"
          onClick={onOpenBackup}
          title="Seguridad y Exportación Local"
          aria-label="Copia de Seguridad"
        >
          <Database size={18} />
        </button>
      </div>
    </header>
  );
}
