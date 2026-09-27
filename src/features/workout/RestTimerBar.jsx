import React, { useEffect, useState, useRef } from 'react';
import { Timer, X } from 'lucide-react';
import { sound } from '../../utils/sound';
import { vibrateRestFinished } from '../../utils/vibrate';

export default function RestTimerBar({
  initialSeconds = 90,
  label = 'Descanso entre Series',
  nextExerciseName = null,
  onFinish,
  onDismiss
}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          sound.playRestFinished();
          vibrateRestFinished();
          if (onFinish) onFinish();
          return 0;
        }

        if (prev <= 4 && prev > 1) {
          sound.playCountdownTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [onFinish]);

  const addTime = (delta) => {
    setSecondsLeft((prev) => {
      const next = Math.max(0, prev + delta);
      if (next > totalSeconds) setTotalSeconds(next);
      return next;
    });
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="rest-timer-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'rgba(217, 147, 90, 0.15)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--bronze-light)'
        }}>
          <Timer size={22} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--bronze-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
          </div>
          <div className="timer-digits tabular-nums">
            {minutes}:{seconds < 10 ? '0' : ''}{seconds}
          </div>
          {nextExerciseName && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Siguiente: <strong style={{ color: 'var(--text-main)' }}>{nextExerciseName}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Progress pill line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '3px',
        width: `${progressPct}%`,
        background: 'var(--gradient-metallic)',
        borderRadius: '8px 8px 0 0',
        transition: 'width 1s linear'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          className="timer-adjust-btn"
          onClick={() => addTime(-15)}
          title="Quitar 15 segundos"
        >
          -15s
        </button>
        <button
          type="button"
          className="timer-adjust-btn"
          onClick={() => addTime(30)}
          title="Añadir 30 segundos"
        >
          +30s
        </button>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Ocultar temporizador"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
