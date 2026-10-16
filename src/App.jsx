import React, { useState, useEffect } from 'react';
import { initDatabase, exportAllData, restoreFromData, db } from './storage/db';
import {
  checkIntegrity,
  refreshMirror,
  flushPendingWorkouts,
  getBestRecoveryData
} from './storage/backups';
import Header from './components/organisms/Header';
import BottomNav from './components/organisms/BottomNav';
import ActiveWorkout from './features/workout/ActiveWorkout';
import RoutinesList from './features/routines/RoutinesList';
import CalendarView from './features/calendar/CalendarView';
import HistoryView from './features/history/HistoryView';
import CardioView from './features/cardio/CardioView';
import BackupModal from './features/backup/BackupModal';

const ACTIVE_SESSION_KEY = 'aurafit_active_session';
const EXPORT_REMINDER_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
const SESSION_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 horas

export default function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [activeSession, setActiveSession] = useState(null);
  const [showBackup, setShowBackup] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [integrityIssue, setIntegrityIssue] = useState(null);
  const [showExportReminder, setShowExportReminder] = useState(false);
  const [initRetry, setInitRetry] = useState(0);

  // Initialize DB, restore pending workouts, verify integrity, restore session
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        await initDatabase();
        if (cancelled) return;

        // Cola de emergencia: entrenaos guardados en localStorage si
        // IndexedDB falló en la sesión anterior
        await flushPendingWorkouts();

        // Verificación de integridad vs. el último espejo conocido
        const integrity = await checkIntegrity();
        if (cancelled) return;
        if (!integrity.ok) {
          setIntegrityIssue(integrity);
        } else {
          await refreshMirror();
        }

        // Recordatorio de exportar copia .json (cada 7 días)
        const reminder = await db.settings.get('lastExportReminderAt');
        const lastTs = reminder && reminder.value ? new Date(reminder.value).getTime() : 0;
        if (Date.now() - lastTs > EXPORT_REMINDER_MS) {
          setShowExportReminder(true);
        }

        setDbError(null);
      } catch (e) {
        // POLÍTICA DE ORO: aquí NUNCA se borra la base de datos.
        // Solo se muestra la pantalla de reintento.
        console.error('Database initialization failed:', e);
        if (!cancelled) setDbError(e);
      } finally {
        if (!cancelled) setIsDbReady(true);
      }

      // Restaurar entreno en curso (localStorage: sobrevive cierre de pestaña)
      try {
        const saved = localStorage.getItem(ACTIVE_SESSION_KEY);
        if (saved && !cancelled) {
          const parsed = JSON.parse(saved);
          const age = Date.now() - new Date(parsed.startedAt).getTime();
          const resume =
            age < SESSION_MAX_AGE_MS ||
            confirm('Se encontró un entrenamiento en curso guardado hace varias horas. ¿Retomarlo?');
          if (resume) {
            setActiveSession(parsed);
          } else {
            localStorage.removeItem(ACTIVE_SESSION_KEY);
          }
        }
      } catch (e) {
        console.warn('Could not restore session:', e);
        try {
          localStorage.removeItem(ACTIVE_SESSION_KEY);
        } catch (_) {
          // ignorar
        }
      }
    }

    setup();
    return () => {
      cancelled = true;
    };
  }, [initRetry]);

  // Save active session to local storage to survive refreshes and closed tabs
  const handleUpdateSession = (session) => {
    setActiveSession(session);
    if (session) {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  };

  const handleStartRoutine = (session) => {
    handleUpdateSession(session);
    setActiveTab('workout');
  };

  const handleFinishWorkout = () => {
    handleUpdateSession(null);
    setActiveTab('calendar');
  };

  const handleCancelWorkout = () => {
    if (confirm('¿Estás seguro de que deseas descartar este entrenamiento en curso?')) {
      handleUpdateSession(null);
    }
  };

  const handleRetryInit = () => {
    setIsDbReady(false);
    setDbError(null);
    setInitRetry((r) => r + 1);
  };

  const handleRestoreFromBackup = async () => {
    try {
      const data = await getBestRecoveryData();
      if (!data) {
        alert('No se encontró ningún respaldo automático disponible. Si tienes un archivo .json, usa "Restaurar Copia" en la pantalla de Copia de Seguridad.');
        return;
      }
      if (confirm('Se restaurarán tus rutinas e historial desde el último respaldo automático. Los datos actuales serán reemplazados. ¿Continuar?')) {
        await restoreFromData(data);
        setIntegrityIssue(null);
        await refreshMirror();
        alert('Datos restaurados correctamente.');
        window.location.reload();
      }
    } catch (e) {
      console.error('Restauración fallida:', e);
      alert(`No se pudo restaurar el respaldo: ${e?.message || 'error desconocido'}`);
    }
  };

  const dismissExportReminder = async () => {
    setShowExportReminder(false);
    try {
      await db.settings.put({ key: 'lastExportReminderAt', value: new Date().toISOString() });
    } catch (e) {
      console.warn('No se pudo registrar el recordatorio:', e);
    }
  };

  const handleExportNow = async () => {
    try {
      await exportAllData();
      await dismissExportReminder();
    } catch (e) {
      alert(`No se pudo exportar la copia: ${e?.message || 'error desconocido'}`);
    }
  };

  if (!isDbReady) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(204, 255, 0, 0.2)',
          borderTopColor: 'var(--bronze-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Cargando AuraFit...</span>
      </div>
    );
  }

  // Pantalla de error de base de datos: NUNCA borra, solo ofrece reintentar
  if (dbError) {
    return (
      <div className="app-container">
        <div className="card" style={{
          margin: 'auto',
          maxWidth: '460px',
          textAlign: 'center',
          padding: '32px 24px',
          border: '1px solid rgba(244, 63, 94, 0.4)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>
            No pudimos abrir tu base de datos
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' }}>
            <strong style={{ color: 'var(--accent-emerald)' }}>Tus datos NO fueron eliminados.</strong>{' '}
            AuraFit nunca borra tu información automáticamente. Este es un error temporal
            del almacenamiento del navegador.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>
            Detalle: {String(dbError?.message || dbError)}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button type="button" className="btn-primary" onClick={handleRetryInit}>
              Reintentar
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
              Si el error persiste, no limpies los datos de este sitio: contacta para
              recuperar la información desde un respaldo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        onOpenBackup={() => setShowBackup(true)}
        activeWorkoutDuration={activeSession ? Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000) : null}
      />

      {/* Banner: datos faltantes detectados (restauración con un clic) */}
      {integrityIssue && (
        <div className="card" style={{
          padding: '16px 18px',
          border: '1px solid rgba(244, 63, 94, 0.45)',
          background: 'rgba(244, 63, 94, 0.08)',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-rose)', marginBottom: '6px' }}>
            ⚠️ Detectamos datos faltantes
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '14px' }}>
            Parece que algunos registros no están en la base de datos actual
            (posible limpieza de datos del navegador). Restaura tu último
            respaldo automático para recuperarlos.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="button" className="btn-primary" onClick={handleRestoreFromBackup}>
              Restaurar respaldo automático
            </button>
            <button type="button" className="btn-secondary" onClick={handleExportNow}>
              Exportar copia actual (.json)
            </button>
          </div>
        </div>
      )}

      {/* Banner: recordatorio de exportación periódica */}
      {showExportReminder && !integrityIssue && (
        <div className="card" style={{
          padding: '14px 16px',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          background: 'rgba(56, 189, 248, 0.07)',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '6px' }}>
            💾 Descarga tu copia de seguridad
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '12px' }}>
            Te recomendamos guardar el archivo .json en tu Drive o nube cada semana.
            Es tu red de seguridad si el navegador borra sus datos.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="button" className="btn-primary" onClick={handleExportNow}>
              Descargar ahora
            </button>
            <button type="button" className="btn-secondary" onClick={dismissExportReminder}>
              Recordármelo en 7 días
            </button>
          </div>
        </div>
      )}

      <main style={{ flex: 1 }}>
        {activeTab === 'workout' && (
          <ActiveWorkout
            session={activeSession}
            onStartSession={handleUpdateSession}
            onFinishSession={handleFinishWorkout}
            onCancelSession={handleCancelWorkout}
            onGoToRoutines={() => setActiveTab('routines')}
          />
        )}

        {activeTab === 'routines' && (
          <RoutinesList onStartRoutine={handleStartRoutine} />
        )}

        {activeTab === 'calendar' && (
          <CalendarView />
        )}

        {activeTab === 'history' && (
          <HistoryView />
        )}

        {activeTab === 'cardio' && (
          <CardioView />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        hasActiveWorkout={Boolean(activeSession)}
      />

      <BackupModal
        isOpen={showBackup}
        onClose={() => setShowBackup(false)}
        onDataRestored={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
