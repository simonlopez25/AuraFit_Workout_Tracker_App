import React, { useState, useEffect } from 'react';
import { Dumbbell, Clock, Flame, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../../storage/db';

export default function HistoryView() {
  const [workouts, setWorkouts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const loadHistory = async () => {
    const list = await db.workouts.reverse().sortBy('date');
    setWorkouts(list);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este registro de entrenamiento?')) {
      await db.workouts.delete(id);
      loadHistory();
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Historial de Sesiones</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Registro completo de entrenamientos realizados y sobrecarga progresiva.
        </p>
      </div>

      {workouts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Dumbbell size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Sin entrenamientos aún</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Completa tu primera sesión para ver aquí el registro detallado de tus series y pesos.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {workouts.map((workout) => {
            const isExpanded = expandedId === workout.id;
            const mins = Math.floor((workout.durationSeconds || 0) / 60);

            return (
              <div
                key={workout.id}
                className="card"
                style={{ padding: '16px', cursor: 'pointer' }}
                onClick={() => toggleExpand(workout.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {workout.date} &middot; {new Date(workout.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                      {workout.routineName}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(workout.id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                         color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px'
                      }}
                      title="Eliminar sesión"
                    >
                      <Trash2 size={16} />
                    </button>
                    {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Metrics chips */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <Clock size={14} />
                    <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{mins} min</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <Flame size={14} color="var(--bronze-primary)" />
                    <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--bronze-primary)' }}>{workout.totalVolumeKg} kg</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <Dumbbell size={14} color="var(--accent-cyan)" />
                    <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{workout.exercises?.length || 0} ejercicios</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {workout.exercises.map((ex, exIdx) => (
                      <div key={exIdx} style={{
                        background: 'var(--bg-surface-elevated)',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                          {ex.name}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {ex.sets.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              style={{
                                fontSize: '11px',
                                background: s.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: s.completed ? 'var(--accent-emerald)' : 'var(--text-dim)',
                                border: `1px solid ${s.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}
                            >
                              S{sIdx + 1}: {s.weightKg || s.targetWeightKg || 0}kg &times; {s.reps || s.targetReps || 0}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
