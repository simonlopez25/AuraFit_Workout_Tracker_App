import React from 'react';

export function Badge({ children, variant = 'bronze', style = {} }) {
  const styles = {
    bronze: {
      background: 'rgba(217, 147, 90, 0.12)',
      border: '1px solid rgba(217, 147, 90, 0.28)',
      color: 'var(--bronze-light)'
    },
    emerald: {
      background: 'rgba(16, 185, 129, 0.12)',
      border: '1px solid rgba(16, 185, 129, 0.28)',
      color: 'var(--accent-emerald)'
    },
    cyan: {
      background: 'rgba(56, 189, 248, 0.12)',
      border: '1px solid rgba(56, 189, 248, 0.28)',
      color: 'var(--accent-cyan)'
    },
    muted: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'var(--text-muted)'
    }
  };

  const currentStyle = styles[variant] || styles.bronze;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        ...currentStyle,
        ...style
      }}
    >
      {children}
    </span>
  );
}
