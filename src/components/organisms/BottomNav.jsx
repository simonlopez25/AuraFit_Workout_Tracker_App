import React from 'react';
import { Dumbbell, Calendar, History, ListChecks, Footprints } from 'lucide-react';

export default function BottomNav({ activeTab, onChangeTab, hasActiveWorkout }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <button
        type="button"
        className={`nav-item ${activeTab === 'workout' ? 'active' : ''}`}
        onClick={() => onChangeTab('workout')}
      >
        <Dumbbell size={19} />
        <span>{hasActiveWorkout ? 'En Vivo' : 'Entrenar'}</span>
      </button>

      <button
        type="button"
        className={`nav-item ${activeTab === 'routines' ? 'active' : ''}`}
        onClick={() => onChangeTab('routines')}
      >
        <ListChecks size={19} />
        <span>Rutinas</span>
      </button>

      <button
        type="button"
        className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => onChangeTab('calendar')}
      >
        <Calendar size={19} />
        <span>Calendario</span>
      </button>

      <button
        type="button"
        className={`nav-item ${activeTab === 'cardio' ? 'active' : ''}`}
        onClick={() => onChangeTab('cardio')}
      >
        <Footprints size={19} />
        <span>Cardio</span>
      </button>

      <button
        type="button"
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => onChangeTab('history')}
      >
        <History size={19} />
        <span>Historial</span>
      </button>
    </nav>
  );
}
