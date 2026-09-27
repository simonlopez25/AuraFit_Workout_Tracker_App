export const EXERCISE_CATALOG = [
  // --- PECHO ---
  { id: 'bench_press', name: 'Press de Banca Plano con Barra', muscle: 'Pecho', category: 'fuerza', defaultRest: 90 },
  { id: 'incline_dumbbell_press', name: 'Press Inclinado con Mancuernas', muscle: 'Pecho Superior', category: 'fuerza', defaultRest: 90 },
  { id: 'decline_press', name: 'Press Declinado', muscle: 'Pecho Inferior', category: 'fuerza', defaultRest: 90 },
  { id: 'chest_flyes_cable', name: 'Aperturas / Cruces en Polea', muscle: 'Pecho', category: 'fuerza', defaultRest: 60 },
  { id: 'pushups_standard', name: 'Flexiones de Pecho', muscle: 'Pecho', category: 'calistenia', defaultRest: 60 },
  { id: 'dips_chest', name: 'Fondos en Paralelas (Pecho)', muscle: 'Pecho & Tríceps', category: 'calistenia', defaultRest: 90 },

  // --- ESPALDA ---
  { id: 'pullups_strict', name: 'Dominadas Pronas Estrictas', muscle: 'Dorsales', category: 'calistenia', defaultRest: 90 },
  { id: 'chinups_supine', name: 'Dominadas Supinas (Chin-ups)', muscle: 'Dorsales & Bíceps', category: 'calistenia', defaultRest: 90 },
  { id: 'barbell_row', name: 'Remo con Barra 45°', muscle: 'Espalda Media', category: 'fuerza', defaultRest: 90 },
  { id: 'lat_pulldown', name: 'Jalón al Pecho en Polea', muscle: 'Dorsales', category: 'fuerza', defaultRest: 75 },
  { id: 'cable_seated_row', name: 'Remo en Polea Baja (Gironda)', muscle: 'Espalda Media', category: 'fuerza', defaultRest: 75 },
  { id: 'deadlift_conventional', name: 'Peso Muerto Convencional', muscle: 'Espalda Baja & Cadena Posterior', category: 'fuerza', defaultRest: 120 },

  // --- HOMBROS ---
  { id: 'overhead_press', name: 'Press Militar con Barra', muscle: 'Hombro Anterior', category: 'fuerza', defaultRest: 90 },
  { id: 'dumbbell_shoulder_press', name: 'Press de Hombros con Mancuernas', muscle: 'Hombro Anterior', category: 'fuerza', defaultRest: 90 },
  { id: 'lateral_raises', name: 'Elevaciones Laterales con Mancuerna', muscle: 'Hombro Lateral', category: 'fuerza', defaultRest: 60 },
  { id: 'cable_lateral_raises', name: 'Elevaciones Laterales en Polea', muscle: 'Hombro Lateral', category: 'fuerza', defaultRest: 60 },
  { id: 'face_pulls', name: 'Face Pulls en Polea Alta', muscle: 'Deltoides Posterior', category: 'fuerza', defaultRest: 60 },

  // --- BRAZOS ---
  { id: 'biceps_barbell_curl', name: 'Curl de Bíceps con Barra Z', muscle: 'Bíceps', category: 'fuerza', defaultRest: 60 },
  { id: 'biceps_incline_curl', name: 'Curl de Bíceps en Banco Inclinado', muscle: 'Bíceps', category: 'fuerza', defaultRest: 60 },
  { id: 'hammer_curl', name: 'Curl Martillo con Mancuernas', muscle: 'Braquial & Antebrazo', category: 'fuerza', defaultRest: 60 },
  { id: 'triceps_rope_pushdown', name: 'Extensiones de Tríceps con Cuerda', muscle: 'Tríceps', category: 'fuerza', defaultRest: 60 },
  { id: 'skull_crushers', name: 'Press Francés con Mancuernas/Barra', muscle: 'Tríceps', category: 'fuerza', defaultRest: 75 },

  // --- PIERNAS ---
  { id: 'squat_barbell', name: 'Sentadilla Trasera con Barra', muscle: 'Cuádriceps & Glúteos', category: 'fuerza', defaultRest: 120 },
  { id: 'front_squat', name: 'Sentadilla Frontal', muscle: 'Cuádriceps', category: 'fuerza', defaultRest: 120 },
  { id: 'leg_press', name: 'Prensa Inclinada 45°', muscle: 'Cuádriceps & Glúteos', category: 'fuerza', defaultRest: 90 },
  { id: 'romanian_deadlift', name: 'Peso Muerto Rumano con Mancuernas', muscle: 'Isquios & Glúteos', category: 'fuerza', defaultRest: 90 },
  { id: 'leg_curl_seated', name: 'Curl Femoral Sentado en Máquina', muscle: 'Isquiosurales', category: 'fuerza', defaultRest: 75 },
  { id: 'leg_extension', name: 'Extensión de Cuádriceps en Máquina', muscle: 'Cuádriceps', category: 'fuerza', defaultRest: 60 },
  { id: 'calf_raises_standing', name: 'Elevación de Talones de Pie', muscle: 'Gemelos', category: 'fuerza', defaultRest: 60 },
  { id: 'bulgarian_split_squat', name: 'Sentadilla Búlgara con Mancuernas', muscle: 'Cuádriceps & Glúteo Mayor', category: 'fuerza', defaultRest: 90 },

  // --- CORE & CALISTENIA ---
  { id: 'plank_abdominal', name: 'Plancha Abdominal Isométrica', muscle: 'Core', category: 'calistenia', defaultRest: 60 },
  { id: 'hanging_leg_raises', name: 'Elevaciones de Piernas Colgado', muscle: 'Abdominales Inferiores', category: 'calistenia', defaultRest: 60 },
  { id: 'ab_wheel_rollout', name: 'Rueda Abdominal', muscle: 'Core Completo', category: 'calistenia', defaultRest: 75 },
  { id: 'muscle_up', name: 'Muscle-Up en Barra', muscle: 'Espalda & Tríceps Explosivo', category: 'calistenia', defaultRest: 120 },
  { id: 'pushups_diamond', name: 'Flexiones Diamante', muscle: 'Tríceps', category: 'calistenia', defaultRest: 60 },

  // --- CARDIO ---
  { id: 'running_treadmill', name: 'Cinta de Correr (Ritmo Constante / Intervalos)', muscle: 'Cardiovascular', category: 'cardio', defaultRest: 60 },
  { id: 'rowing_machine', name: 'Remo Ergómetro (Concept2)', muscle: 'Cuerpo Completo & Cardio', category: 'cardio', defaultRest: 60 },
  { id: 'jump_rope', name: 'Comba / Salto de Cuerda', muscle: 'Cardiovascular & Coordinación', category: 'cardio', defaultRest: 45 }
];
