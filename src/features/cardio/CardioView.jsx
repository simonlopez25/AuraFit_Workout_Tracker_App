import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Flame, Gauge, Footprints, Timer, Plus } from 'lucide-react';
import { db } from '../../storage/db';
import { sound } from '../../utils/sound';

const ACTIVITIES = [
  { id: 'walk', label: 'Caminata', icon: '🚶', defaultPace: 12 },
  { id: 'jog', label: 'Trote', icon: '🏃', defaultPace: 9 },
  { id: 'run', label: 'Running', icon: '🏃‍♂️', defaultPace: 6 },
  { id: 'hiit', label: 'HIIT', icon: '⚡', defaultPace: 0 }
];

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function calculateCalories(activityId, distanceKm, weightKg, minutes) {
  const mets = {
    walk: 3.5,
    jog: 7.5,
    run: 10,
    hiit: 11
  };
  const met = mets[activityId] || 6;
  const kcal = Math.round(met * weightKg * (minutes / 60));
  return Math.max(0, kcal);
}

export default function CardioView() {
  const [activityId, setActivityId] = useState('run');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(3);
  const [weightKg, setWeightKg] = useState(72);
  const [savedMessage, setSavedMessage] = useState(null);

  const intervalRef = useRef(null);
  const activity = ACTIVITIES.find((a) => a.id === activityId) || ACTIVITIES[3];

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const minutes = elapsedSeconds / 60;
  const paceMinPerKm = distanceKm > 0 ? minutes / distanceKm : null;
  const calories = calculateCalories(activityId, distanceKm, weightKg, minutes);

  const handleToggle = () => {
    setIsRunning((prev) => !prev);
  };

  const handleFinish = async () => {
    setIsRunning(false);
    sound.playRestFinished();

    const endedAt = new Date().toISOString();
    const workoutRecord = {
      id: `wo_cardio_${Date.now()}`,
      routineId: null,
      routineName: `Cardio · ${activity.label}`,
      date: endedAt.slice(0, 10),
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      endedAt,
      durationSeconds: elapsedSeconds,
      totalVolumeKg: 0,
      totalReps: 0,
      exercises: [
        {
          name: activity.label,
          sets: [
            {
              reps: 0,
              weightKg: 0,
              completed: true,
              meta: {
                distanceKm,
                weightKg,
                calories,
                paceMinPerKm: paceMinPerKm ? Number(paceMinPerKm.toFixed(2)) : null
              }
            }
          ]
        }
      ],
      notes: ''
    };

    await db.workouts.add(workoutRecord);
    setSavedMessage('Sesión guardada en tu historial');
    setElapsedSeconds(0);
    setDistanceKm(activityId === 'hiit' ? 0 : distanceKm);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setSavedMessage(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Cardio & Running</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Registra caminatas, trote, running o HIIT y sigue tu progreso.
        </p>
      </div>

      {/* Activity selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {ACTIVITIES.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => {
              setActivityId(act.id);
              handleReset();
            }}
            style={{
              background: activityId === act.id ? 'var(--gradient-btn)' : 'var(--bg-surface)',
              color: activityId === act.id ? '#090a0d' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              fontWeight: 800,
              fontSize: '12px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ marginRight: '4px' }}>{act.icon}</span>
            {act.label}
          </button>
        ))}
      </div>

      {/* Hero timer card */}
      <div className="card" style={{
        background: 'linear-gradient(150deg, #161a25 0%, #0c0e14 100%)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)'
      }}>
        <div style={{ textAlign: 'center', padding: '18px 0 6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--bronze-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            {activity.icon} {activity.label}
          </div>
          <div className="tabular-nums" style={{ fontSize: '56px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginTop: '18px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={isRunning ? handleToggle : handleToggle}
            style={{ minWidth: '140px' }}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} fill="#090a0d" />}
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleFinish}
            disabled={elapsedSeconds === 0}
            style={{ minWidth: '140px', opacity: elapsedSeconds === 0 ? 0.6 : 1 }}
          >
            <Square size={16} />
            Finalizar
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
            style={{ minWidth: '90px' }}
          >
            Reiniciar
          </button>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px'
      }}>
        <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
            <Footprints size={13} color="var(--bronze-primary)" /> Distancia
          </div>
          <input
            type="number"
            min={0}
            max={999}
            step={0.01}
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value) || 0)}
            disabled={isRunning}
            style={{
              width: '100%',
              textAlign: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '20px',
              fontWeight: 800,
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>km</span>
        </div>

        <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
            <Gauge size={13} color="var(--bronze-primary)" /> Ritmo
          </div>
          <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
            {paceMinPerKm ? `${paceMinPerKm.toFixed(2)}` : '--:--'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>min/km</span>
        </div>

        <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
            <Flame size={13} color="var(--accent-emerald)" /> Calorías
          </div>
          <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {calories}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>kcal</span>
        </div>
      </div>

      {/* Secondary inputs */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
              Peso corporal
            </label>
            <input
              type="number"
              min={30}
              max={250}
              step={0.5}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value) || 0)}
              disabled={isRunning}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
              Duración
            </label>
            <div style={{
              padding: '10px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '14px',
              fontWeight: 700
            }}>
              {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid var(--accent-emerald)',
          color: 'var(--accent-emerald)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 700
        }}>
          {savedMessage}
        </div>
      )}
    </div>
  );
}
