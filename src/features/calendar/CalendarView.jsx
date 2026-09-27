import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../../storage/db';
import { Badge } from '../../components/atoms/Button';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState(null);
  const [selectedDayString, setSelectedDayString] = useState(null);

  const loadWorkouts = async () => {
    const list = await db.workouts.toArray();
    setWorkouts(list);
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayWorkouts(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayWorkouts(null);
  };

  const workoutsByDate = {};
  let monthTotalVolume = 0;
  let monthTrainedDays = new Set();

  workouts.forEach((w) => {
    if (!workoutsByDate[w.date]) {
      workoutsByDate[w.date] = [];
    }
    workoutsByDate[w.date].push(w);

    const wDate = new Date(w.date);
    if (wDate.getFullYear() === year && wDate.getMonth() === month) {
      monthTotalVolume += (w.totalVolumeKg || 0);
      monthTrainedDays.add(w.date);
    }
  });

  const handleSelectDay = (dayNumber) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(dayNumber).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const dayLogs = workoutsByDate[dateStr] || [];

    setSelectedDayString(`${dayNumber} de ${monthNames[month]}`);
    setSelectedDayWorkouts(dayLogs);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Consistencia & Registro</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          La verdadera métrica del progreso: días cumplidos y disciplina acumulada.
        </p>
      </div>

      {/* Month Metrics Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        background: 'var(--bg-surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            Días Entrenados
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--bronze-light)', marginTop: '4px' }}>
            {monthTrainedDays.size}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            Volumen Total
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {monthTotalVolume} <span style={{ fontSize: '12px', color: 'var(--bronze-primary)' }}>kg</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            Racha Activa
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {monthTrainedDays.size > 0 ? `${monthTrainedDays.size} días` : '0 días'}
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card" style={{ padding: '20px' }}>
        {/* Month Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
            {monthNames[month]} {year}
          </h3>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn-icon"
              style={{ width: '38px', height: '38px' }}
              onClick={prevMonth}
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="btn-icon"
              style={{ width: '38px', height: '38px' }}
              onClick={nextMonth}
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '10px' }}>
          {weekDays.map((d) => (
            <span key={d} style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`empty_${i}`} style={{ height: '46px' }} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateStr = `${year}-${monthStr}-${dayStr}`;
            const hasWorkout = Boolean(workoutsByDate[dateStr]?.length);
            const isToday = new Date().toISOString().slice(0, 10) === dateStr;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleSelectDay(dayNum)}
                style={{
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  border: isToday ? '1px solid var(--bronze-primary)' : '1px solid var(--border-subtle)',
                  background: hasWorkout ? 'rgba(217, 147, 90, 0.18)' : 'var(--bg-surface-elevated)',
                  color: hasWorkout ? 'var(--bronze-light)' : 'var(--text-main)',
                  fontWeight: hasWorkout || isToday ? 800 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{dayNum}</span>
                {hasWorkout && (
                  <span style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--bronze-primary)',
                    boxShadow: '0 0 6px var(--bronze-glow)',
                    marginTop: '2px'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Workout Details */}
      {selectedDayString && (
        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '10px' }}>
            Registro del {selectedDayString}
          </h3>

          {selectedDayWorkouts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Día de descanso programado o sin sesiones registradas.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedDayWorkouts.map((workout) => (
                <div key={workout.id} style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--bronze-light)' }}>
                      {workout.routineName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {Math.floor(workout.durationSeconds / 60)} min &middot; {workout.totalVolumeKg} kg
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {workout.exercises.map((ex, eIdx) => {
                      const completedCount = ex.sets.filter((s) => s.completed).length;
                      const maxWeight = Math.max(0, ...ex.sets.map((s) => Number(s.weightKg) || 0));
                      return (
                        <div key={eIdx} style={{ fontSize: '12px', color: 'var(--text-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{ex.name}</span>
                          <span>{completedCount} series {maxWeight > 0 ? `(máx ${maxWeight}kg)` : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
