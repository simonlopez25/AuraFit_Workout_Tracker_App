import Dexie from 'dexie';

export const db = new Dexie('AuraFitProDB');

// Database schema definition
db.version(1).stores({
  routines: 'id, name, category, updatedAt',
  workouts: 'id, routineId, routineName, date, startedAt, endedAt',
  schedule: 'dayIndex, routineId',
  settings: 'key'
});

// Seed default routines only on first installation
async function seedDefaults() {
  try {
    const defaultRoutines = [
    {
      id: 'push_hypertrophy',
      name: 'Empuje — Fuerza & Pectoral (Push)',
      category: 'fuerza',
      targetRestSeconds: 90,
      days: [0, 3], // Lunes y Jueves
      exercises: [
        {
          id: 'bench_press',
          name: 'Press de Banca Plano con Barra',
          muscle: 'Pecho',
          sets: [
            { setNumber: 1, targetReps: 8, targetWeightKg: 60, completed: false },
            { setNumber: 2, targetReps: 8, targetWeightKg: 65, completed: false },
            { setNumber: 3, targetReps: 6, targetWeightKg: 70, completed: false },
            { setNumber: 4, targetReps: 6, targetWeightKg: 70, completed: false }
          ]
        },
        {
          id: 'incline_dumbbell_press',
          name: 'Press Inclinado con Mancuernas',
          muscle: 'Pecho Superior',
          sets: [
            { setNumber: 1, targetReps: 10, targetWeightKg: 22, completed: false },
            { setNumber: 2, targetReps: 10, targetWeightKg: 24, completed: false },
            { setNumber: 3, targetReps: 8, targetWeightKg: 24, completed: false }
          ]
        },
        {
          id: 'lateral_raises',
          name: 'Elevaciones Laterales con Mancuerna',
          muscle: 'Hombro Lateral',
          sets: [
            { setNumber: 1, targetReps: 15, targetWeightKg: 10, completed: false },
            { setNumber: 2, targetReps: 12, targetWeightKg: 12, completed: false },
            { setNumber: 3, targetReps: 12, targetWeightKg: 12, completed: false },
            { setNumber: 4, targetReps: 15, targetWeightKg: 10, completed: false }
          ]
        },
        {
          id: 'triceps_rope_pushdown',
          name: 'Extensiones de Tríceps en Polea',
          muscle: 'Tríceps',
          sets: [
            { setNumber: 1, targetReps: 12, targetWeightKg: 25, completed: false },
            { setNumber: 2, targetReps: 12, targetWeightKg: 27.5, completed: false },
            { setNumber: 3, targetReps: 10, targetWeightKg: 30, completed: false }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pull_hypertrophy',
      name: 'Tracción — Espalda & Bíceps (Pull)',
      category: 'fuerza',
      targetRestSeconds: 90,
      days: [1, 4], // Martes y Viernes
      exercises: [
        {
          id: 'pullups_weighted',
          name: 'Dominadas con Lastre / Estrictas',
          muscle: 'Espalda',
          sets: [
            { setNumber: 1, targetReps: 8, targetWeightKg: 0, completed: false },
            { setNumber: 2, targetReps: 8, targetWeightKg: 5, completed: false },
            { setNumber: 3, targetReps: 6, targetWeightKg: 10, completed: false }
          ]
        },
        {
          id: 'barbell_row',
          name: 'Remo con Barra 45°',
          muscle: 'Dorsales / Espalda Media',
          sets: [
            { setNumber: 1, targetReps: 10, targetWeightKg: 50, completed: false },
            { setNumber: 2, targetReps: 8, targetWeightKg: 60, completed: false },
            { setNumber: 3, targetReps: 8, targetWeightKg: 60, completed: false }
          ]
        },
        {
          id: 'face_pulls',
          name: 'Face Pulls en Polea Alta',
          muscle: 'Deltoides Posterior',
          sets: [
            { setNumber: 1, targetReps: 15, targetWeightKg: 20, completed: false },
            { setNumber: 2, targetReps: 15, targetWeightKg: 22.5, completed: false },
            { setNumber: 3, targetReps: 15, targetWeightKg: 22.5, completed: false }
          ]
        },
        {
          id: 'biceps_incline_curl',
          name: 'Curl de Bíceps en Banco Inclinado',
          muscle: 'Bíceps',
          sets: [
            { setNumber: 1, targetReps: 12, targetWeightKg: 12, completed: false },
            { setNumber: 2, targetReps: 10, targetWeightKg: 14, completed: false },
            { setNumber: 3, targetReps: 10, targetWeightKg: 14, completed: false }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'legs_core_power',
      name: 'Pierna & Core — Fuerza Base (Legs)',
      category: 'fuerza',
      targetRestSeconds: 120,
      days: [2], // Miércoles
      exercises: [
        {
          id: 'squat_barbell',
          name: 'Sentadilla Trasera con Barra',
          muscle: 'Cuádriceps & Glúteos',
          sets: [
            { setNumber: 1, targetReps: 8, targetWeightKg: 80, completed: false },
            { setNumber: 2, targetReps: 6, targetWeightKg: 90, completed: false },
            { setNumber: 3, targetReps: 6, targetWeightKg: 95, completed: false },
            { setNumber: 4, targetReps: 6, targetWeightKg: 95, completed: false }
          ]
        },
        {
          id: 'romanian_deadlift',
          name: 'Peso Muerto Rumano',
          muscle: 'Isquios & Glúteos',
          sets: [
            { setNumber: 1, targetReps: 10, targetWeightKg: 70, completed: false },
            { setNumber: 2, targetReps: 10, targetWeightKg: 75, completed: false },
            { setNumber: 3, targetReps: 8, targetWeightKg: 80, completed: false }
          ]
        },
        {
          id: 'leg_press',
          name: 'Prensa Inclinada 45°',
          muscle: 'Piernas Completo',
          sets: [
            { setNumber: 1, targetReps: 12, targetWeightKg: 140, completed: false },
            { setNumber: 2, targetReps: 10, targetWeightKg: 160, completed: false },
            { setNumber: 3, targetReps: 10, targetWeightKg: 180, completed: false }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'calisthenics_elite',
      name: 'Calistenia — Peso Corporal & Control',
      category: 'calistenia',
      targetRestSeconds: 90,
      days: [5], // Sábado
      exercises: [
        {
          id: 'dips_chest',
          name: 'Fondos en Paralelas',
          muscle: 'Pecho & Tríceps',
          sets: [
            { setNumber: 1, targetReps: 12, targetWeightKg: 0, completed: false },
            { setNumber: 2, targetReps: 10, targetWeightKg: 0, completed: false },
            { setNumber: 3, targetReps: 10, targetWeightKg: 0, completed: false }
          ]
        },
        {
          id: 'pullups_strict',
          name: 'Dominadas Pronas Estrictas',
          muscle: 'Espalda & Core',
          sets: [
            { setNumber: 1, targetReps: 8, targetWeightKg: 0, completed: false },
            { setNumber: 2, targetReps: 7, targetWeightKg: 0, completed: false },
            { setNumber: 3, targetReps: 6, targetWeightKg: 0, completed: false }
          ]
        },
        {
          id: 'pushups_diamond',
          name: 'Flexiones Diamante',
          muscle: 'Tríceps & Pectoral',
          sets: [
            { setNumber: 1, targetReps: 15, targetWeightKg: 0, completed: false },
            { setNumber: 2, targetReps: 12, targetWeightKg: 0, completed: false },
            { setNumber: 3, targetReps: 10, targetWeightKg: 0, completed: false }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  await db.routines.bulkAdd(defaultRoutines);

  // Initial default schedule: Lunes = Empuje, Martes = Tracción, Miércoles = Pierna, Jueves = Empuje, Viernes = Tracción, Sábado = Calistenia
  const defaultSchedule = [
    { dayIndex: 0, routineId: 'push_hypertrophy', routineName: 'Empuje (Push)' },
    { dayIndex: 1, routineId: 'pull_hypertrophy', routineName: 'Tracción (Pull)' },
    { dayIndex: 2, routineId: 'legs_core_power', routineName: 'Pierna & Core' },
    { dayIndex: 3, routineId: 'push_hypertrophy', routineName: 'Empuje (Push)' },
    { dayIndex: 4, routineId: 'pull_hypertrophy', routineName: 'Tracción (Pull)' },
    { dayIndex: 5, routineId: 'calisthenics_elite', routineName: 'Calistenia' }
  ];
  await db.schedule.bulkAdd(defaultSchedule);

  // Default settings
  await db.settings.bulkPut([
    { key: 'hasInitializedDatabase', value: true },
    { key: 'soundEnabled', value: true },
    { key: 'vibrationEnabled', value: true },
    { key: 'wakeLockEnabled', value: true },
    { key: 'defaultRestSeconds', value: 90 }
  ]);
  } catch (error) {
    console.error('Error seeding default routines:', error);
    throw error;
  }
}

export async function initDatabase() {
  try {
    await db.open();
    const isInitialized = await db.settings.get('hasInitializedDatabase');
    if (!isInitialized) {
      await seedDefaults();
    }
  } catch (error) {
    console.error('Database initialization failed, attempting reset:', error);
    try {
      await db.delete();
      await seedDefaults();
    } catch (resetError) {
      console.error('Failed to reset database after initialization error:', resetError);
    }
  }
}

// Optional helper to reload sample routines on request
export async function seedSampleRoutines() {
  try {
    await db.settings.delete('hasInitializedDatabase');
    await seedDefaults();
  } catch (error) {
    console.error('Failed to seed sample routines:', error);
  }
}

// Backup Export & Import Utilities
export async function exportAllData() {
  const routines = await db.routines.toArray();
  const workouts = await db.workouts.toArray();
  const schedule = await db.schedule.toArray();
  const settings = await db.settings.toArray();

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      routines,
      workouts,
      schedule,
      settings
    }
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aurafit_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.data) throw new Error('Formato de backup inválido');

    await db.transaction('rw', db.routines, db.workouts, db.schedule, db.settings, async () => {
      if (parsed.data.routines?.length) {
        await db.routines.clear();
        await db.routines.bulkAdd(parsed.data.routines);
      }
      if (parsed.data.workouts?.length) {
        await db.workouts.clear();
        await db.workouts.bulkAdd(parsed.data.workouts);
      }
      if (parsed.data.schedule?.length) {
        await db.schedule.clear();
        await db.schedule.bulkAdd(parsed.data.schedule);
      }
      if (parsed.data.settings?.length) {
        await db.settings.clear();
        await db.settings.bulkPut(parsed.data.settings);
      }
    });

    return { success: true, message: 'Datos importados correctamente.' };
  } catch (err) {
    console.error('Error importando backup:', err);
    return { success: false, message: err.message || 'Error al procesar el archivo.' };
  }
}
