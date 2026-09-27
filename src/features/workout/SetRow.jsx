import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import StepperInput from '../../components/StepperInput';
import { sound } from '../../utils/sound';
import { vibrateSetComplete } from '../../utils/vibrate';

export default function SetRow({
  set,
  index,
  onUpdate,
  onToggleComplete,
  onDelete
}) {
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextCompleted = !set.completed;
    if (nextCompleted) {
      sound.playSetComplete();
      vibrateSetComplete();
    }
    onToggleComplete(index, nextCompleted);
  };

  const setTypes = [
    { key: 'work', label: 'Efectiva', color: 'var(--bronze-light)' },
    { key: 'warmup', label: 'Calentamiento', color: 'var(--text-muted)' },
    { key: 'failure', label: 'Al Fallo', color: 'var(--accent-rose)' },
    { key: 'drop', label: 'Drop Set', color: 'var(--accent-cyan)' }
  ];

  const currentType = setTypes.find((t) => t.key === set.type) || setTypes[0];

  // Epley 1RM formula calculation
  const weight = Number(set.weightKg ?? set.targetWeightKg ?? 0);
  const reps = Number(set.reps ?? set.targetReps ?? 10);
  const est1RM = reps > 1 && weight > 0 ? Math.round(weight * (1 + reps / 30)) : weight;

  return (
    <div style={{ position: 'relative' }}>
      <div className={`set-row ${set.completed ? 'completed' : ''}`}>
        {/* Set number & type trigger */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '15px', color: set.completed ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
            #{index + 1}
          </span>
          <button
            type="button"
            onClick={() => setShowTypePicker(!showTypePicker)}
            className="set-type-tag"
            style={{ color: currentType.color, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {currentType.label.slice(0, 4)}
          </button>
        </div>

        {/* Weight Stepper */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              Carga (kg)
            </span>
            {weight > 0 && reps > 0 && (
              <span style={{ fontSize: '9px', color: 'var(--bronze-primary)', fontWeight: 700 }} title="1RM Estimado">
                1RM: {est1RM}kg
              </span>
            )}
          </div>
          <StepperInput
            value={weight}
            step={2.5}
            quickSteps={[2.5, 5]}
            unit="kg"
            onChange={(newWeight) => onUpdate(index, { weightKg: newWeight, targetWeightKg: newWeight })}
          />
        </div>

        {/* Reps Stepper */}
        <div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>
            Reps Real
          </span>
          <StepperInput
            value={reps}
            step={1}
            min={0}
            quickSteps={[1, 2]}
            onChange={(newReps) => onUpdate(index, { reps: newReps, targetReps: newReps })}
          />
        </div>

        {/* Actions: Checkmark & Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            className={`set-check-btn ${set.completed ? 'completed' : ''}`}
            onClick={handleToggle}
            aria-label={set.completed ? "Desmarcar serie" : "Completar serie"}
          >
            <Check size={24} strokeWidth={3} />
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(index)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Eliminar serie"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Set Type Menu dropdown */}
      {showTypePicker && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '10px',
          background: '#141822',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 50,
          boxShadow: 'var(--shadow-luxury)'
        }}>
          {setTypes.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                onUpdate(index, { type: t.key });
                setShowTypePicker(false);
              }}
              style={{
                background: set.type === t.key ? 'rgba(217, 147, 90, 0.15)' : 'none',
                border: 'none',
                color: t.color,
                fontSize: '11px',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 'var(--radius-xs)',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
