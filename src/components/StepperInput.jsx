import React from 'react';
import { Plus, Minus } from 'lucide-react';

export default function StepperInput({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  unit = '',
  quickSteps = []
}) {
  const handleDecrement = (e) => {
    e.stopPropagation();
    const next = Math.max(min, Number((value - step).toFixed(2)));
    onChange(next);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    const next = Math.min(max, Number((value + step).toFixed(2)));
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div className="stepper-container">
        <button
          type="button"
          className="stepper-btn"
          onClick={handleDecrement}
          aria-label="Disminuir valor"
        >
          <Minus size={16} />
        </button>
        <span className="stepper-val tabular-nums">
          {value}{unit ? ` ${unit}` : ''}
        </span>
        <button
          type="button"
          className="stepper-btn"
          onClick={handleIncrement}
          aria-label="Aumentar valor"
        >
          <Plus size={16} />
        </button>
      </div>

      {quickSteps.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          {quickSteps.map((quickStep) => (
            <button
              key={quickStep}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(Number((value + quickStep).toFixed(2)));
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-muted)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              +{quickStep}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
