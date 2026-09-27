import React, { useState } from 'react';
import { Plus, XCircle, Dumbbell } from 'lucide-react';

export default function CustomExerciseModal({ isOpen, onClose, onExerciseCreated }) {
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState('Pecho');
  const [category, setCategory] = useState('fuerza');
  const [defaultRest, setDefaultRest] = useState(90);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Escribe el nombre del ejercicio');

    const customExercise = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      muscle,
      category,
      defaultRest: Number(defaultRest) || 90,
      isCustom: true
    };

    onExerciseCreated(customExercise);
    onClose();
  };

  const muscleGroups = [
    'Pecho', 'Espalda', 'Hombros', 'Cuádriceps', 'Isquiosurales',
    'Glúteos', 'Bíceps', 'Tríceps', 'Antebrazo', 'Core / Abdomen', 'Gemelos', 'Cardiovascular'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dumbbell size={20} color="var(--bronze-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Crear Ejercicio Propio</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <XCircle size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              Nombre del Ejercicio
            </label>
            <input
              type="text"
              placeholder="ej. Press Francés en Polea, Sentadilla Zercher..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Grupo Muscular
              </label>
              <select
                value={muscle}
                onChange={(e) => setMuscle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {muscleGroups.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Modalidad
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="fuerza">Fuerza / Pesas</option>
                <option value="calistenia">Calistenia</option>
                <option value="cardio">Cardio & HIIT</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              Descanso Sugerido (segundos)
            </label>
            <input
              type="number"
              value={defaultRest}
              onChange={(e) => setDefaultRest(e.target.value)}
              min={30}
              max={300}
              step={15}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', minHeight: '50px', marginTop: '6px' }}
          >
            <Plus size={18} /> Guardar y Usar en Rutina
          </button>
        </form>
      </div>
    </div>
  );
}
