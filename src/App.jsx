import React, { useState, useEffect } from 'react';
import { initDatabase } from './storage/db';
import Header from './components/organisms/Header';
import BottomNav from './components/organisms/BottomNav';
import ActiveWorkout from './features/workout/ActiveWorkout';
import RoutinesList from './features/routines/RoutinesList';
import CalendarView from './features/calendar/CalendarView';
import HistoryView from './features/history/HistoryView';
import CardioView from './features/cardio/CardioView';
import BackupModal from './features/backup/BackupModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [activeSession, setActiveSession] = useState(null);
  const [showBackup, setShowBackup] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);

  // Initialize DB and restore any ongoing workout from sessionStorage
  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
      } catch (e) {
        console.error('Database initialization failed:', e);
      } finally {
        setIsDbReady(true);
      }

      const saved = sessionStorage.getItem('aurafit_active_session');
      if (saved) {
        try {
          setActiveSession(JSON.parse(saved));
        } catch (e) {
          console.warn('Could not restore session:', e);
        }
      }
    }
    setup();
  }, []);

  // Save active session to session storage to survive inadvertent refreshes
  const handleUpdateSession = (session) => {
    setActiveSession(session);
    if (session) {
      sessionStorage.setItem('aurafit_active_session', JSON.stringify(session));
    } else {
      sessionStorage.removeItem('aurafit_active_session');
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

  return (
    <div className="app-container">
      <Header
        onOpenBackup={() => setShowBackup(true)}
        activeWorkoutDuration={activeSession ? Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000) : null}
      />

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
