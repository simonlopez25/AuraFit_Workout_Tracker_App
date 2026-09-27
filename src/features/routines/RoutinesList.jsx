import React, { useState, useEffect } from 'react';
import { Play, Plus, Dumbbell, Trash2, ArrowUp, ArrowDown, Settings2, Clock, Check, XCircle, Sparkles } from 'lucide-react';
import { db, seedSampleRoutines } from '../../storage/db';
import { EXERCISE_CATALOG } from '../../data/exerciseCatalog';
import CustomExerciseModal from './CustomExerciseModal';
import { Badge } from '../../components/atoms/Button';

export default function RoutinesList({ onStartRoutine }) {
  const [routines, setRoutines] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomExModal, setShowCustomExModal] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState(null);

  // New routine builder state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('fuerza');
  const [routineExercises, setRoutineExercises] = useState([]);
  const [searchExercise, setSearchExercise] = useState('');
  const [allAvailableExercises, setAllAvailableExercises] = useState(EXERCISE_CATALOG);

  const loadRoutines = async () => {
    const list = await db.routines.toArray();
    setRoutines(list);
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  const handleStart = (routine) => {
    const sessionExercises = routine.exercises.map((ex) => ({
      ...ex,
      targetRestSeconds: ex.targetRestSeconds || routine.targetRestSeconds || 90,
      transitionRestSeconds: ex.transitionRestSeconds || 120,
      sets: Array.from({ length: ex.setsCount || ex.sets?.length || 3 }).map((_, idx) => {
        const existingSet = ex.sets?.[idx];
        return {
          setNumber: idx + 1,
          type: idx === 0 && (ex.setsCount > 3) ? 'warmup' : 'work',
          reps: existingSet?.targetReps ?? existingSet?.reps ?? ex.defaultReps ?? 10,
          weightKg: existingSet?.targetWeightKg ?? existingSet?.weightKg ?? ex.defaultWeightKg ?? 20,
          completed: false
        };
      })
    }));

    onStartRoutine({
      id: routine.id,
      name: routine.name,
      category: routine.category,
      exercises: sessionExercises,
      startedAt: new Date().toISOString()
    });
  };

  const handleConfirmDelete = async () => {
    if (routineToDelete) {
      await db.routines.delete(routineToDelete.id);
      setRoutineToDelete(null);
      await loadRoutines();
    }
  };

  const handleReloadSamples = async () => {
    await seedSampleRoutines();
    await loadRoutines();
  };

  const handleAddExerciseToRoutine = (ex) => {
    setRoutineExercises((prev) => [
      ...prev,
      {
        id: ex.id,
        name: ex.name,
        muscle: ex.muscle,
        category: ex.category || newCategory,
        setsCount: 3,
        defaultReps: 10,
        defaultWeightKg: 20,
        targetRestSeconds: ex.defaultRest || 90,
        transitionRestSeconds: 120, // Academia standard: 2 min between exercises
        techniqueNote: ''
      }
    ]);
  };

  const handleRemoveExerciseFromRoutine = (index) => {
    setRoutineExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveExercise = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= routineExercises.length) return;
    const nextList = [...routineExercises];
    const item = nextList.splice(index, 1)[0];
    nextList.splice(targetIndex, 0, item);
    setRoutineExercises(nextList);
  };

  const handleUpdateExerciseParam = (index, field, value) => {
    setRoutineExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleCustomExerciseCreated = (customEx) => {
    setAllAvailableExercises((prev) => [customEx, ...prev]);
    handleAddExerciseToRoutine(customEx);
  };

  const handleSaveRoutine = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return alert('Escribe un nombre para la rutina');
    if (routineExercises.length === 0) return alert('Añade al menos un ejercicio a la rutina');

    const formattedExercises = routineExercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      muscle: ex.muscle,
      category: ex.category,
      setsCount: Number(ex.setsCount) || 3,
      targetRestSeconds: Number(ex.targetRestSeconds) || 90,
      transitionRestSeconds: Number(ex.transitionRestSeconds) || 120,
      techniqueNote: ex.techniqueNote || '',
      sets: Array.from({ length: Number(ex.setsCount) || 3 }).map((_, sIdx) => ({
        setNumber: sIdx + 1,
        targetReps: Number(ex.defaultReps) || 10,
        targetWeightKg: Number(ex.defaultWeightKg) || 0,
        completed: false
      }))
    }));

    const newRoutine = {
      id: `routine_${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      targetRestSeconds: 90,
      exercises: formattedExercises,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.routines.add(newRoutine);
    setShowCreateModal(false);
    setNewName('');
    setRoutineExercises([]);
    loadRoutines();
  };

  const filteredCatalog = allAvailableExercises.filter((item) =>
    item.name.toLowerCase().includes(searchExercise.toLowerCase()) ||
    item.muscle.toLowerCase().includes(searchExercise.toLowerCase())
  );

  const filteredRoutines = routines.filter((r) => {
    if (filterCategory === 'all') return true;
    return r.category === filterCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>Tus Rutinas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '14px' }}>
            Diseñadas bajo principios de sobrecarga progresiva y descansos específicos.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          style={{ minHeight: '48px', padding: '12px 20px', fontSize: '14px', marginTop: '10px' }}
          onClick={() => {
            setRoutineExercises([]);
            setNewName('');
            setShowCreateModal(true);
          }}
        >
          <Plus size={17} /> Crear Rutina
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'fuerza', label: 'Fuerza / Pesas' },
          { key: 'calistenia', label: 'Calistenia' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterCategory(tab.key)}
            style={{
              background: filterCategory === tab.key ? 'var(--gradient-btn)' : 'var(--bg-surface)',
              color: filterCategory === tab.key ? '#090a0d' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              fontWeight: 800,
              fontSize: '12px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State when no routines exist */}
      {routines.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border-subtle)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--bronze-soft-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            color: 'var(--bronze-light)'
          }}>
            <Dumbbell size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Todo Limpio — Sin Rutinas</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '360px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
            Has eliminado todas las rutinas. Puedes crear tu propia rutina personalizada o restaurar las plantillas de ejemplo cuando quieras.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setRoutineExercises([]);
                setNewName('');
                setShowCreateModal(true);
              }}
            >
              <Plus size={16} /> Crear Nueva Rutina
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReloadSamples}
            >
              <Sparkles size={16} color="var(--bronze-primary)" /> Cargar Plantillas de Ejemplo
            </button>
          </div>
        </div>
      )}

      {/* Routine Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredRoutines.map((routine) => (
          <div key={routine.id} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Badge variant="bronze">{routine.category}</Badge>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {routine.exercises?.length || 0} ejercicios planificados
                  </span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {routine.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRoutineToDelete(routine);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 'var(--radius-xs)',
                  transition: 'color 0.15s'
                }}
                title="Eliminar rutina"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Exercises Preview Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
              {routine.exercises.map((ex, i) => (
                <span
                  key={i}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-subtle)',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ color: 'var(--bronze-primary)', fontWeight: 800 }}>{i + 1}.</span> {ex.name}
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                    ({ex.setsCount || ex.sets?.length || 3}&times;{ex.sets?.[0]?.targetReps || 10})
                  </span>
                </span>
              ))}
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', minHeight: '50px', fontSize: '14px' }}
              onClick={() => handleStart(routine)}
            >
              <Play size={16} fill="#090a0d" />
              Iniciar Entrenamiento
            </button>
          </div>
        ))}
      </div>

      {/* Routine Builder Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings2 size={20} color="var(--bronze-primary)" />
                <h3 style={{ fontSize: '19px', fontWeight: 800 }}>Creador Profesional de Rutinas</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Nombre de la Rutina
                </label>
                <input
                  type="text"
                  placeholder="ej. Fuerza Máxima Torso, Pierna Hipertrofia..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
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
                    <option value="fuerza">Fuerza / Musculación</option>
                    <option value="calistenia">Calistenia & Peso Corporal</option>
                    <option value="cardio">Cardio & Acondicionamiento</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowCustomExModal(true)}
                    style={{ width: '100%', minHeight: '44px', fontSize: '13px' }}
                  >
                    <Sparkles size={15} color="var(--bronze-primary)" />
                    + Crear Ejercicio Propio
                  </button>
                </div>
              </div>

              {/* Added Exercises in Routine (Configurable) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--bronze-light)', textTransform: 'uppercase' }}>
                    Ejercicios en la Rutina ({routineExercises.length})
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Sin límite (puedes agregar 7 o más)
                  </span>
                </div>

                {routineExercises.length === 0 ? (
                  <div style={{
                    padding: '24px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '13px'
                  }}>
                    Selecciona ejercicios del catálogo o crea uno propio para añadirlos aquí.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {routineExercises.map((ex, index) => (
                      <div
                        key={index}
                        style={{
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'var(--bronze-soft-bg)',
                              color: 'var(--bronze-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 800
                            }}>
                              {index + 1}
                            </span>
                            <div>
                              <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{ex.name}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{ex.muscle}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveExercise(index, -1)}
                              disabled={index === 0}
                              style={{ background: 'none', border: 'none', color: index === 0 ? 'var(--border-subtle)' : 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                              title="Subir orden"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveExercise(index, 1)}
                              disabled={index === routineExercises.length - 1}
                              style={{ background: 'none', border: 'none', color: index === routineExercises.length - 1 ? 'var(--border-subtle)' : 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                              title="Bajar orden"
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveExerciseFromRoutine(index)}
                              style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '4px' }}
                              title="Eliminar de rutina"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Science parameters: sets, reps, weight, rest between sets, rest to next exercise */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                              Series
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={ex.setsCount}
                              onChange={(e) => handleUpdateExerciseParam(index, 'setsCount', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                background: '#0e1017',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-xs)',
                                color: 'var(--text-main)',
                                fontSize: '13px',
                                fontWeight: 700
                              }}
                            />
                          </div>

                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                              Reps Obj.
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={ex.defaultReps}
                              onChange={(e) => handleUpdateExerciseParam(index, 'defaultReps', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                background: '#0e1017',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-xs)',
                                color: 'var(--text-main)',
                                fontSize: '13px',
                                fontWeight: 700
                              }}
                            />
                          </div>

                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                              Descanso Series
                            </span>
                            <select
                              value={ex.targetRestSeconds}
                              onChange={(e) => handleUpdateExerciseParam(index, 'targetRestSeconds', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 4px',
                                background: '#0e1017',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-xs)',
                                color: 'var(--bronze-light)',
                                fontSize: '12px',
                                fontWeight: 700
                              }}
                            >
                              <option value={45}>45s</option>
                              <option value={60}>60s</option>
                              <option value={75}>75s</option>
                              <option value={90}>90s</option>
                              <option value={120}>120s (2m)</option>
                              <option value={180}>180s (3m)</option>
                            </select>
                          </div>

                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--bronze-primary)', fontWeight: 700, display: 'block', marginBottom: '2px' }} title="Descanso al terminar este ejercicio y pasar al siguiente">
                              Transición Ej.
                            </span>
                            <select
                              value={ex.transitionRestSeconds}
                              onChange={(e) => handleUpdateExerciseParam(index, 'transitionRestSeconds', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 4px',
                                background: '#0e1017',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-xs)',
                                color: 'var(--bronze-light)',
                                fontSize: '12px',
                                fontWeight: 700
                              }}
                            >
                              <option value={60}>60s (1m)</option>
                              <option value={90}>90s (1.5m)</option>
                              <option value={120}>120s (2m)</option>
                              <option value={150}>150s (2.5m)</option>
                              <option value={180}>180s (3m)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add from catalog selector */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Añadir Ejercicios del Catálogo
                </label>
                <input
                  type="text"
                  placeholder="Buscar ejercicio o grupo muscular (ej. Sentadilla, Pecho, Dominadas)..."
                  value={searchExercise}
                  onChange={(e) => setSearchExercise(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    marginBottom: '8px',
                    outline: 'none'
                  }}
                />

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {filteredCatalog.map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => handleAddExerciseToRoutine(ex)}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{ex.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ex.muscle} &middot; {ex.category}</div>
                      </div>
                      <Plus size={16} color="var(--bronze-primary)" />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', minHeight: '52px', marginTop: '8px' }}
              >
                Guardar Rutina Completa ({routineExercises.length} ejercicios)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Exercise Creator Sub-Modal */}
      <CustomExerciseModal
        isOpen={showCustomExModal}
        onClose={() => setShowCustomExModal(false)}
        onExerciseCreated={handleCustomExerciseCreated}
      />

      {/* Routine Delete Confirmation Modal */}
      {routineToDelete && (
        <div className="modal-overlay" onClick={() => setRoutineToDelete(null)}>
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              ¿Eliminar "{routineToDelete.name}"?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '22px', lineHeight: '1.5' }}>
              Esta acción eliminará esta rutina de tu almacenamiento local permanentemente. Puedes crear una nueva en cualquier momento.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setRoutineToDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                style={{ justifyContent: 'center', minHeight: '48px', fontSize: '14px' }}
                onClick={handleConfirmDelete}
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
