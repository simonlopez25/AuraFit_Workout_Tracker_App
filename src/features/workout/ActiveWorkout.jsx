import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, Plus, CheckCircle2, XCircle, Dumbbell, Flame, Clock, Layers, Sparkles } from 'lucide-react';
import SetRow from './SetRow';
import RestTimerBar from './RestTimerBar';
import { wakeLock } from '../../utils/wakeLock';
import { db } from '../../storage/db';
import { EXERCISE_CATALOG } from '../../data/exerciseCatalog';
import CustomExerciseModal from '../routines/CustomExerciseModal';
import { Badge } from '../../components/atoms/Button';

export default function ActiveWorkout({
  session,
  onStartSession,
  onFinishSession,
  onCancelSession,
  onGoToRoutines
}) {
  const [activeRestState, setActiveRestState] = useState(null); // { seconds, label, nextExercise }
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showCustomExModal, setShowCustomExModal] = useState(false);
  const [searchExercise, setSearchExercise] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [availableCatalog, setAvailableCatalog] = useState(EXERCISE_CATALOG);

  // Keep screen awake while workout is active
  useEffect(() => {
    if (session) {
      wakeLock.request();
      const interval = setInterval(() => {
        const start = new Date(session.startedAt).getTime();
        const now = Date.now();
        setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
      }, 1000);
      return () => {
        clearInterval(interval);
        wakeLock.release();
      };
    }
  }, [session]);

  if (!session) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '42px 24px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(217, 147, 90, 0.1)',
            border: '1px solid rgba(217, 147, 90, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto',
            color: 'var(--bronze-light)'
          }}>
            <Dumbbell size={34} />
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
            Sesión de Entrenamiento
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto 26px auto', lineHeight: '1.6' }}>
            Selecciona una rutina planificada o inicia una sesión libre. Los descansos entre series y entre ejercicios se gestionarán con precisión científica.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '340px', margin: '0 auto' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onGoToRoutines}
            >
              <Play size={18} fill="#090a0d" />
              Elegir Rutina Planificada
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                onStartSession({
                  id: `free_${Date.now()}`,
                  name: 'Entrenamiento Libre',
                  category: 'fuerza',
                  exercises: [
                    {
                      id: 'bench_press',
                      name: 'Press de Banca Plano con Barra',
                      muscle: 'Pecho',
                      targetRestSeconds: 90,
                      transitionRestSeconds: 120,
                      sets: [
                        { setNumber: 1, type: 'warmup', reps: 12, weightKg: 40, completed: false },
                        { setNumber: 2, type: 'work', reps: 8, weightKg: 60, completed: false },
                        { setNumber: 3, type: 'work', reps: 8, weightKg: 65, completed: false }
                      ]
                    }
                  ],
                  startedAt: new Date().toISOString()
                });
              }}
            >
              <Plus size={18} />
              Iniciar Entrenamiento Libre
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate live volume and sets
  let totalVolume = 0;
  let totalCompletedSets = 0;
  let totalSets = 0;

  session.exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      totalSets++;
      if (s.completed) {
        totalCompletedSets++;
        totalVolume += (Number(s.weightKg) || 0) * (Number(s.reps) || 0);
      }
    });
  });

  const handleUpdateSet = (exerciseIndex, setIndex, updatedFields) => {
    const nextExercises = [...session.exercises];
    nextExercises[exerciseIndex].sets[setIndex] = {
      ...nextExercises[exerciseIndex].sets[setIndex],
      ...updatedFields
    };
    onStartSession({ ...session, exercises: nextExercises });
  };

  const handleToggleComplete = (exerciseIndex, setIndex, isCompleted) => {
    const nextExercises = [...session.exercises];
    nextExercises[exerciseIndex].sets[setIndex].completed = isCompleted;
    onStartSession({ ...session, exercises: nextExercises });

    if (isCompleted) {
      const currentExercise = nextExercises[exerciseIndex];
      const allSetsInExerciseDone = currentExercise.sets.every((s) => s.completed);
      const isLastExercise = exerciseIndex === nextExercises.length - 1;

      if (allSetsInExerciseDone && !isLastExercise) {
        // Inter-exercise transition rest!
        const nextExName = nextExercises[exerciseIndex + 1]?.name || 'Siguiente Ejercicio';
        const transitionTime = currentExercise.transitionRestSeconds || 120;
        setActiveRestState({
          seconds: transitionTime,
          label: 'Descanso entre Ejercicios (Transición)',
          nextExercise: nextExName
        });
      } else {
        // Inter-set rest!
        const setRestTime = currentExercise.targetRestSeconds || 90;
        setActiveRestState({
          seconds: setRestTime,
          label: `Descanso Serie (${currentExercise.name})`,
          nextExercise: null
        });
      }
    }
  };

  const handleAddSet = (exerciseIndex) => {
    const nextExercises = [...session.exercises];
    const prevSet = nextExercises[exerciseIndex].sets.slice(-1)[0] || { reps: 10, weightKg: 20 };
    nextExercises[exerciseIndex].sets.push({
      setNumber: nextExercises[exerciseIndex].sets.length + 1,
      type: 'work',
      reps: prevSet.reps,
      weightKg: prevSet.weightKg,
      completed: false
    });
    onStartSession({ ...session, exercises: nextExercises });
  };

  const handleDeleteSet = (exerciseIndex, setIndex) => {
    const nextExercises = [...session.exercises];
    nextExercises[exerciseIndex].sets.splice(setIndex, 1);
    onStartSession({ ...session, exercises: nextExercises });
  };

  const handleAddExerciseToSession = (ex) => {
    const nextExercises = [...session.exercises];
    nextExercises.push({
      id: ex.id,
      name: ex.name,
      muscle: ex.muscle,
      targetRestSeconds: ex.defaultRest || 90,
      transitionRestSeconds: 120,
      sets: [
        { setNumber: 1, type: 'work', reps: 10, weightKg: 20, completed: false },
        { setNumber: 2, type: 'work', reps: 10, weightKg: 20, completed: false },
        { setNumber: 3, type: 'work', reps: 10, weightKg: 20, completed: false }
      ]
    });
    onStartSession({ ...session, exercises: nextExercises });
    setShowAddExerciseModal(false);
  };

  const handleCustomExerciseCreated = (customEx) => {
    setAvailableCatalog((prev) => [customEx, ...prev]);
    handleAddExerciseToSession(customEx);
  };

  const handleFinish = async () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });

    const endedAt = new Date().toISOString();
    const workoutRecord = {
      id: `wo_${Date.now()}`,
      routineId: session.id || null,
      routineName: session.name || 'Entrenamiento',
      date: endedAt.slice(0, 10),
      startedAt: session.startedAt,
      endedAt: endedAt,
      durationSeconds: elapsedSeconds,
      totalVolumeKg: totalVolume,
      totalReps: session.exercises.reduce((acc, ex) => acc + ex.sets.reduce((sAcc, s) => sAcc + (s.completed ? Number(s.reps) : 0), 0), 0),
      exercises: session.exercises,
      notes: ''
    };

    await db.workouts.add(workoutRecord);
    onFinishSession(workoutRecord);
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredCatalog = availableCatalog.filter((item) =>
    item.name.toLowerCase().includes(searchExercise.toLowerCase()) ||
    item.muscle.toLowerCase().includes(searchExercise.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Session Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(150deg, #161a25 0%, #0c0e14 100%)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--bronze-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Entrenamiento en Curso
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '2px', color: 'var(--text-main)' }}>
              {session.name}
            </h2>
          </div>

          <button
            type="button"
            className="btn-danger"
            onClick={onCancelSession}
            title="Descartar sesión"
          >
            <XCircle size={15} />
            <span>Descartar</span>
          </button>
        </div>

        {/* Live Metrics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          padding: '14px',
          borderRadius: 'var(--radius-md)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700 }}>
              <Clock size={13} color="var(--bronze-primary)" /> Duración
            </div>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '3px' }}>
              {formatDuration(elapsedSeconds)}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700 }}>
              <Flame size={13} color="var(--bronze-primary)" /> Volumen
            </div>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--bronze-light)', marginTop: '3px' }}>
              {totalVolume} <span style={{ fontSize: '12px', fontWeight: 600 }}>kg</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700 }}>
              <Layers size={13} color="var(--accent-emerald)" /> Series
            </div>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '3px' }}>
              {totalCompletedSets} / {totalSets}
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List in Session */}
      {session.exercises.map((exercise, exIndex) => {
        const isAllSetsCompleted = exercise.sets.every((s) => s.completed);

        return (
          <div
            key={`${exercise.id}_${exIndex}`}
            className="card"
            style={{
              borderColor: isAllSetsCompleted ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: isAllSetsCompleted ? 'var(--accent-emerald)' : 'var(--bronze-soft-bg)',
                    color: isAllSetsCompleted ? '#051d14' : 'var(--bronze-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>
                    {exIndex + 1}
                  </span>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {exercise.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>{exercise.muscle}</span>
                  <span>&middot;</span>
                  <span>Descanso serie: <strong style={{ color: 'var(--bronze-light)' }}>{exercise.targetRestSeconds || 90}s</strong></span>
                  <span>&middot;</span>
                  <span>Transición: <strong style={{ color: 'var(--bronze-primary)' }}>{exercise.transitionRestSeconds || 120}s</strong></span>
                </div>
              </div>

              {isAllSetsCompleted && (
                <Badge variant="emerald">Completado</Badge>
              )}
            </div>

            {/* Sets list */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {exercise.sets.map((set, setIndex) => (
                <SetRow
                  key={setIndex}
                  set={set}
                  index={setIndex}
                  onUpdate={(sIdx, fields) => handleUpdateSet(exIndex, sIdx, fields)}
                  onToggleComplete={(sIdx, completed) => handleToggleComplete(exIndex, sIdx, completed)}
                  onDelete={(sIdx) => handleDeleteSet(exIndex, sIdx)}
                />
              ))}
            </div>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', marginTop: '10px', minHeight: '44px', fontSize: '13px' }}
              onClick={() => handleAddSet(exIndex)}
            >
              <Plus size={16} /> Añadir Serie
            </button>
          </div>
        );
      })}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowAddExerciseModal(true)}
          style={{ width: '100%', minHeight: '50px' }}
        >
          <Plus size={18} /> Añadir Ejercicio a Esta Sesión
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={handleFinish}
          style={{ width: '100%', minHeight: '56px', fontSize: '16px' }}
        >
          <CheckCircle2 size={20} />
          Finalizar Sesión ({totalCompletedSets} series completas)
        </button>
      </div>

      {/* Floating Rest Timer with intra-set and transition awareness */}
      {activeRestState && (
        <RestTimerBar
          initialSeconds={activeRestState.seconds}
          label={activeRestState.label}
          nextExerciseName={activeRestState.nextExercise}
          onFinish={() => setActiveRestState(null)}
          onDismiss={() => setActiveRestState(null)}
        />
      )}

      {/* Add Exercise Modal (Catalog or Custom) */}
      {showAddExerciseModal && (
        <div className="modal-overlay" onClick={() => setShowAddExerciseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Añadir Ejercicio a la Sesión</h3>
              <button
                type="button"
                onClick={() => setShowAddExerciseModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <XCircle size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Buscar por ejercicio o músculo..."
                value={searchExercise}
                onChange={(e) => setSearchExercise(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCustomExModal(true)}
                title="Crear ejercicio propio"
                style={{ minHeight: '44px', padding: '0 14px' }}
              >
                <Sparkles size={16} color="var(--bronze-primary)" />
              </button>
            </div>

            <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredCatalog.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToSession(ex)}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{ex.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {ex.muscle} &middot; Descanso: {ex.defaultRest || 90}s
                    </div>
                  </div>
                  <Plus size={18} color="var(--bronze-primary)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Exercise creator inside workout */}
      <CustomExerciseModal
        isOpen={showCustomExModal}
        onClose={() => setShowCustomExModal(false)}
        onExerciseCreated={handleCustomExerciseCreated}
      />
    </div>
  );
}
