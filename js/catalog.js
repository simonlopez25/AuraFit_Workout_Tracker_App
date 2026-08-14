/**
 * AuraFit Pro — Global Exercise & Biomechanics Catalog (catalog.js)
 * Catálogo mundial de ejercicios de musculación y calistenia con análisis biomecánico,
 * técnica de ejecución, prevención de lesiones e imágenes HD demostrativas de alta relevancia.
 */

const GLOBAL_EXERCISE_CATALOG = [
  {
    id: "pseudo_planche",
    name: "Pseudo-planche",
    category: "Pecho",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Deltoides Anterior", "Pectoral Mayor", "Serrato Anterior", "Core"],
    benefit: "Máxima tensión mecánica en deltoides anterior simulando el vector de fuerza de la plancha. Desarrolla fuerza de empuje escapular recta.",
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80", // Pushup lean form
    technique: [
      "Coloca las manos apuntando ligeramente hacia afuera o atrás a la altura de la cadera.",
      "Inclina el torso hacia adelante manteniendo los codos bloqueados y escápulas protráctiles (espalda alta arqueada).",
      "Baja el pecho controladamente manteniendo la inclinación y empuja fuerte arriba."
    ],
    commonErrors: [
      "Perder la inclinación hacia adelante al descender (transformándolo en flexión común).",
      "Dejar caer la cadera o perder la contracción del abdomen."
    ]
  },
  {
    id: "archer",
    name: "Archer",
    category: "Pecho",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Pectoral Mayor", "Deltoides Anterior", "Tríceps (brazo de apoyo)"],
    benefit: "Sobrecarga unilateral progresiva de empuje. Prepara las articulaciones para flexiones a una sola mano.",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80", // Wide arm action
    technique: [
      "Adopta una posición de flexión con las manos bastante más anchas que los hombros.",
      "Desciende hacia un lado doblando ese codo, mientras el brazo contrario permanece totalmente recto.",
      "Empuja hacia arriba regresando al centro y alterna hacia el lado opuesto."
    ],
    commonErrors: [
      "Doblar el brazo que debería permanecer estirado.",
      "Rotar el torso en exceso en lugar de mantener el pecho paralelo al suelo."
    ]
  },
  {
    id: "diamante",
    name: "Diamante",
    category: "Pecho",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Tríceps Braquial", "Pectoral Interno", "Deltoides Anterior"],
    benefit: "Maximiza el reclutamiento del tríceps braquial y la porción clavicular del pectoral mediante una aducción estrecha de hombro.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80", // Diamond pushup focus
    technique: [
      "Une los dedos índices y pulgares formando un diamante bajo el centro del pecho.",
      "Desciende flexionando los codos hacia atrás pegados al torso.",
      "Empuja con las palmas de las manos bloqueando los codos arriba."
    ],
    commonErrors: [
      "Abrir los codos excesivamente hacia los lados (estrés lesivo en codos).",
      "No realizar el rango completo de movimiento abajo."
    ]
  },
  {
    id: "normales_lentas",
    name: "Normales lentas",
    category: "Pecho",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Pectoral Mayor", "Tríceps", "Core"],
    benefit: "Aumenta el tiempo bajo tensión (TUT) en fase excéntrica y concéntrica para maximizar la hipertrofia sin sobrecargar articulaciones.",
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80", // Perfect plank form
    technique: [
      "Manos a la anchura de hombros, baja en 3-4 segundos.",
      "Realiza una pausa de 1 segundo en la parte inferior sin tocar el suelo.",
      "Sube de manera controlada en 2 segundos."
    ],
    commonErrors: [
      "Apresurarse en la fase excéntrica de bajada.",
      "Arquear la columna por fatiga."
    ]
  },
  {
    id: "abiertas",
    name: "Abiertas",
    category: "Pecho",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Pectoral Mayor (Fibras Externas)", "Deltoides"],
    benefit: "Aísla la porción externa del pectoral mayor reduciendo el recorrido de flexión del codo y aumentando la abducción horizontal.",
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Coloca las manos a una distancia de aproximadamente 1.5 veces el ancho de hombros.",
      "Desciende controladamente sintiendo el estiramiento del pectoral.",
      "Empuja regresando arriba contrayendo el pecho."
    ],
    commonErrors: [
      "Rango de movimiento excesivamente corto.",
      "Hombros encogidos hacia las orejas."
    ]
  },
  {
    id: "bench_press",
    name: "Press de Banca con Barra",
    category: "Pecho",
    type: "heavy",
    typeName: "Carga Pesada / Barra",
    targetMuscles: ["Pectoral Mayor", "Deltoides Anterior", "Tríceps Braquial"],
    benefit: "Ejercicio multiarticular básico para construir fuerza máxima de empuje horizontal y densidad en el pectoral mediante tensión mecánica elevada.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Retrae y deprime las escápulas clavándolas en el banco.",
      "Mantén un ligero arco lumbar biomecánico con los pies firmes apoyados en el suelo (leg drive).",
      "Desciende la barra de forma controlada hasta la parte media del esternón.",
      "Empuja explosivamente manteniendo los codos a unos 45°-60° respecto al torso."
    ],
    commonErrors: [
      "Despegar la cadera/glúteos del banco en el punto máximo de esfuerzo.",
      "Abrir los codos a 90° respecto al torso.",
      "Rebotar la barra contra el esternón."
    ]
  },
  {
    id: "squat_barbell",
    name: "Sentadilla Trasera con Barra",
    category: "Piernas",
    type: "heavy",
    typeName: "Carga Pesada / Barra",
    targetMuscles: ["Cuádriceps", "Glúteo Mayor", "Erectores Espinales", "Adúctores"],
    benefit: "El pilar de fuerza para el tren inferior. Estimula gran masa muscular y genera máxima respuesta neuromuscular y densidad ósea.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Coloca la barra sobre los trapecios y contrae la espalda superior.",
      "Inicia la bajada flexionando cadera y rodillas en simultáneo.",
      "Desciende manteniendo el torso erguido hasta romper la paralela.",
      "Empuja el suelo con toda la planta del pie manteniendo las rodillas alineadas."
    ],
    commonErrors: [
      "Valgo de rodilla (colapso de rodillas hacia adentro al subir).",
      "Guiño pélvico excesivo (retroversión pélvica en la fase profunda)."
    ]
  },
  {
    id: "romanian_deadlift",
    name: "Peso Muerto Rumano",
    category: "Piernas",
    type: "heavy",
    typeName: "Carga Pesada / Barra",
    targetMuscles: ["Isquiosurales", "Glúteo Mayor", "Erectores de la Columna"],
    benefit: "Maximiza el trabajo en elongación de los isquiosurales mediante una bisagra de cadera pura.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Sujeta la barra a la anchura de hombros con las rodillas ligeramente desbloqueadas.",
      "Empuja la cadera hacia atrás como si quisieras tocar una pared con los glúteos.",
      "Mantiene la barra pegada a los muslos durante todo el descenso."
    ],
    commonErrors: [
      "Flexionar en exceso las rodillas transformándolo en una sentadilla.",
      "Curvar la zona lumbar en la parte baja."
    ]
  },
  {
    id: "pullups",
    name: "Dominadas de Espalda (Pull-ups)",
    category: "Espalda",
    type: "bodyweight",
    typeName: "Peso Corporal / Lastre",
    targetMuscles: ["Dorsal Ancho", "Redondo Mayor", "Bíceps Braquial", "Trapecio Inferior"],
    benefit: "Desarrolla la amplitud de la espalda (V-Taper) y fuerza relativa máxima en tracción vertical.",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Agarra la barra con palmas hacia afuera (prono) un poco más ancho que los hombros.",
      "Inicia la tracción deprimiendo las escápulas.",
      "Lleva el pecho hacia la barra hasta que la barbilla supere el agarre."
    ],
    commonErrors: [
      "Kipping o impulsos con las piernas.",
      "No extender los brazos abajo (acortar el rango excéntrico)."
    ]
  },
  {
    id: "dumbbell_overhead_press",
    name: "Press Militar con Mancuernas",
    category: "Hombros",
    type: "dumbbell",
    typeName: "Mancuerna",
    targetMuscles: ["Deltoides Anterior", "Deltoides Lateral", "Tríceps", "Trapecio Superior"],
    benefit: "Permite una ruta de movimiento natural y unilateral para los hombros.",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Sentado o de pie con tronco firme, apoya las mancuernas a la altura de los hombros.",
      "Empuja verticalmente cerrando ligeramente la trayectoria sin chocar las mancuernas."
    ],
    commonErrors: [
      "Arquear excesivamente la espalda baja por falta de estabilidad en el core."
    ]
  },
  {
    id: "plank_core",
    name: "Plancha Abdominal Isométrica",
    category: "Core",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Transverso del Abdomen", "Recto Abdominal", "Oblicuos"],
    benefit: "Fortalece la capacidad anti-extensión de la columna, protegiendo la zona lumbar.",
    image: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Apoya los antebrazos bajo los hombros y las puntas de los pies.",
      "Aprieta glúteos, abdomen y cuadríceps."
    ],
    commonErrors: [
      "Hundir la cadera hacia el suelo."
    ]
  }
];

function getMuscleCategories() {
  return ["Todos", "Pecho", "Espalda", "Piernas", "Hombros", "Brazos", "Core"];
}

function findExerciseInCatalog(searchTerm) {
  if (!searchTerm) return null;
  const cleanTerm = searchTerm.trim().toLowerCase();
  return GLOBAL_EXERCISE_CATALOG.find(ex => 
    ex.id === cleanTerm || 
    ex.name.toLowerCase() === cleanTerm ||
    ex.name.toLowerCase().includes(cleanTerm)
  );
}
