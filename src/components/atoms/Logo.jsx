import React from 'react';

export default function Logo({ size = 36, showGlow = true }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {showGlow && (
        <div style={{
          position: 'absolute',
          width: `${size * 1.2}px`,
          height: `${size * 1.2}px`,
          background: 'radial-gradient(circle, rgba(217, 147, 90, 0.4) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(6px)',
          zIndex: 0
        }} />
      )}
      <img
        src="/aurafit-logo.png"
        alt="AuraFit"
        className="brand-logo-img"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          zIndex: 1,
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
