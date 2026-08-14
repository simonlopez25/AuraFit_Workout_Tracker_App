/**
 * AuraFit Pro — Global Exercise & Biomechanics Catalog (catalog.js)
 * Catálogo mundial de ejercicios de musculación y calistenia con análisis biomecánico,
 * técnica de ejecución, prevención de lesiones e imágenes HD demostrativas.
 */

const GLOBAL_EXERCISE_CATALOG = [
  // --- PECHO ---
  {
    id: "bench_press",
    name: "Press de Banca Plano con Barra",
    category: "Pecho",
    subMuscle: "Medio",
    type: "heavy",
    typeName: "Barra / Pesado",
    targetMuscles: ["Medio", "Pectoral Mayor", "Tríceps", "Deltoides Anterior"],
    benefit: "Multiarticular básico para construir fuerza máxima de empuje horizontal e hipertrofia del pectoral medio.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Retrae y deprime las escápulas clavándolas firmemente en el banco.",
      "Mantén un arco fisiológico con apoyo total de pies (leg drive).",
      "Desciende controladamente al esternón y empuja explosivo con codos a 45°-60°."
    ],
    commonErrors: ["Despegar la cadera del banco", "Rebotar la barra en el esternón", "Abrir codos a 90°"]
  },
  {
    id: "incline_dumbbell_press",
    name: "Press Inclinado con Mancuernas",
    category: "Pecho",
    subMuscle: "Superior",
    type: "dumbbell",
    typeName: "Mancuerna",
    targetMuscles: ["Superior", "Pectoral Clavicular", "Deltoides Anterior"],
    benefit: "Enfoca la tensión en el haz clavicular del pectoral superior con libertad articular de muñecas.",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Banco inclinado a 30°-45°.",
      "Desciende las mancuernas abriendo los codos a 45° del torso sintiendo el estiramiento clavicular.",
      "Empuja convergiendo ligeramente sin chocar las mancuernas."
    ],
    commonErrors: ["Inclinación excesiva del banco (>45°) convirtiéndolo en hombro", "Rango de bajada incompleto"]
  },
  {
    id: "dips_chest",
    name: "Fondos en Paralelas (Enfoque Pecho)",
    category: "Pecho",
    subMuscle: "Inferior",
    type: "bodyweight",
    typeName: "Peso Corporal / Lastre",
    targetMuscles: ["Inferior", "Pectoral Abdominal", "Tríceps", "Deltoides Anterior"],
    benefit: "Excelente reclutamiento de la porción inferior del pectoral y empuje con autocarga.",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Inclina el torso 30° hacia adelante con codos ligeramente abiertos.",
      "Baja hasta que el hombro quede al nivel del codo (90°).",
      "Empuja concentrando la fuerza en el pecho inferior."
    ],
    commonErrors: ["Torso completamente vertical (activa más tríceps)", "Descender por debajo del rango seguro articular"]
  },
  {
    id: "diamond_pushups",
    name: "Flexiones Diamante",
    category: "Pecho",
    subMuscle: "Inferior",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Inferior", "Pectoral Interno", "Tríceps"],
    benefit: "Aducción estrecha para estimular la unión esternal del pectoral y tríceps.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Une índices y pulgares formando un diamante bajo el pecho.",
      "Baja tocando el centro de las manos y empuja con fuerza."
    ],
    commonErrors: ["Abrir los codos lateralmente hacia fuera", "Curvar la zona lumbar"]
  },
  {
    id: "normal_pushups",
    name: "Flexiones de Brazos Controladas",
    category: "Pecho",
    subMuscle: "Medio",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Medio", "Pectoral Mayor", "Core", "Tríceps"],
    benefit: "Patrón fundamental de empuje horizontal y estabilidad de tronco.",
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Manos al ancho de hombros, torso en plancha firme.",
      "Baja en 3 segundos hasta rozar el suelo y sube con control."
    ],
    commonErrors: ["Dejar caer la cadera", "Hacer repeticiones cortas"]
  },

  // --- HOMBROS ---
  {
    id: "overhead_press",
    name: "Press Militar con Barra / Mancuernas",
    category: "Hombros",
    subMuscle: "Deltoides Anterior",
    type: "heavy",
    typeName: "Carga / Barra",
    targetMuscles: ["Deltoides Anterior", "Tríceps", "Trapecio Superior", "Core"],
    benefit: "Fuerza básica de empuje vertical para densidad del hombro anterior y estabilidad escapular.",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80",
    technique: [
      "De pie o sentado con abdomen y glúteos contraídos.",
      "Empuja la barra verticalmente pasando justo por delante del rostro.",
      "Bloquea arriba con la barra alineada sobre la coronilla."
    ],
    commonErrors: ["Arquear excesivamente la zona lumbar", "Usar impulso con rodillas sin control"]
  },
  {
    id: "lateral_raises",
    name: "Elevaciones Laterales con Mancuernas",
    category: "Hombros",
    subMuscle: "Deltoides Lateral",
    type: "dumbbell",
    typeName: "Mancuerna / Aislamiento",
    targetMuscles: ["Deltoides Lateral"],
    benefit: "Aislamiento directo para ensanchar los hombros y lograr aspecto de V-Taper.",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Ligera inclinación del torso hacia adelante, codos con micro-flexión.",
      "Eleva los brazos en el plano escapular (30° adelantado) hasta la horizontal.",
      "Baja en 2-3 segundos reteniendo la carga."
    ],
    commonErrors: ["Balancear el torso para subir el peso", "Subir por encima de la línea de los hombros con rotación interna"]
  },
  {
    id: "face_pulls",
    name: "Face Pulls con Cuerda en Polea",
    category: "Hombros",
    subMuscle: "Deltoides Posterior",
    type: "cable",
    typeName: "Polea",
    targetMuscles: ["Deltoides Posterior", "Romboides", "Manguito Rotador", "Trapecio"],
    benefit: "Salud postural de hombros, previene el síndrome cruzado anterior y refuerza el deltoides posterior.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Polea a la altura de los ojos con cuerda.",
      "Jala la cuerda hacia la frente separando las manos y rotando los hombros hacia atrás.",
      "Aprieta las escápulas 1 segundo en la contracción máxima."
    ],
    commonErrors: ["Tirar hacia el pecho en lugar de hacia los ojos", "Cargar demasiado peso y arquear la espalda"]
  },
  {
    id: "pseudo_planche",
    name: "Pseudo-planche Push-ups",
    category: "Hombros",
    subMuscle: "Deltoides Anterior",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Deltoides Anterior", "Pectoral Mayor", "Serrato Anterior", "Core"],
    benefit: "Máxima tensión mecánica en deltoides anterior simulando el vector de fuerza de la plancha.",
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Manos apuntando hacia afuera o atrás a la altura de la cadera.",
      "Inclina el torso hacia adelante manteniendo escápulas protráctiles.",
      "Baja el pecho manteniendo la inclinación y empuja fuerte arriba."
    ],
    commonErrors: ["Perder la inclinación al descender", "Dejar caer la pelvis"]
  },

  // --- ESPALDA ---
  {
    id: "pullups",
    name: "Dominadas Pronas (Pull-ups)",
    category: "Espalda",
    subMuscle: "Dorsal Ancho",
    type: "bodyweight",
    typeName: "Peso Corporal / Lastre",
    targetMuscles: ["Dorsal Ancho", "Redondo Mayor", "Bíceps", "Trapecio Inferior"],
    benefit: "Desarrolla amplitud dorsal máxima y fuerza de tracción vertical.",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Agarre prono algo más ancho que los hombros.",
      "Inicia la tracción deprimiendo escápulas y llevando el pecho a la barra.",
      "Supera la barra con la barbilla y desciende controlando hasta colgar completamente."
    ],
    commonErrors: ["Hacer balanceos o kipping", "Rango corto sin estiramiento inferior"]
  },
  {
    id: "barbell_row",
    name: "Remo con Barra (Pendlay / Inclinado)",
    category: "Espalda",
    subMuscle: "Dorsal Ancho",
    type: "heavy",
    typeName: "Barra / Pesado",
    targetMuscles: ["Dorsal Ancho", "Romboides", "Trapecio Medio", "Lumbares"],
    benefit: "Grosor y densidad de la espalda media y dorsal con alta sobrecarga progresiva.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Torso inclinado a 45° o paralelo al suelo, espalda recta.",
      "Tracciona la barra hacia el ombligo guiando con los codos pegados al cuerpo.",
      "Contrae la espalda 1 segundo y baja controladamente."
    ],
    commonErrors: ["Curvar la columna lumbar", "Impulsarse con el torso"]
  },
  {
    id: "shrugs_traps",
    name: "Encogimientos de Hombros con Barra / Mancuernas",
    category: "Espalda",
    subMuscle: "Trapecio",
    type: "heavy",
    typeName: "Mancuerna / Barra",
    targetMuscles: ["Trapecio", "Trapecio Superior", "Trapecio Medio"],
    benefit: "Hipertrofia focalizada en el trapecio y estabilidad cervical.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Sujeta la carga con brazos rectos.",
      "Eleva los hombros verticalmente hacia las orejas.",
      "Pausa 2 segundos en el punto de máxima contracción y desciende lento."
    ],
    commonErrors: ["Rotar los hombros en círculos (estrés lesivo)", "Flexionar los codos"]
  },
  {
    id: "cable_row_rhomboids",
    name: "Remo Gironda / Polea Baja al Pecho",
    category: "Espalda",
    subMuscle: "Romboides",
    type: "cable",
    typeName: "Polea",
    targetMuscles: ["Romboides", "Trapecio Medio", "Dorsal Ancho"],
    benefit: "Aísla la retracción escapular y los romboides con tensión continua.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Sentado con espalda erguida y rodillas ligeramente dobladas.",
      "Jala el agarre hacia el esternón juntando las escápulas.",
      "Estira los brazos permitiendo que las escápulas se separen sin curvar la espalda baja."
    ],
    commonErrors: ["Balanceo excesivo hacia adelante y atrás"]
  },
  {
    id: "deadlift_lower_back",
    name: "Peso Muerto Convencional",
    category: "Espalda",
    subMuscle: "Lumbares",
    type: "heavy",
    typeName: "Barra / Pesado",
    targetMuscles: ["Lumbares", "Erectores Espinales", "Glúteos", "Isquiotibiales", "Trapecio"],
    benefit: "Genera máxima fuerza en toda la cadena posterior y refuerzo de erectores lumbares.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Barra pegada a las tibias, pies al ancho de caderas.",
      "Agarre firme, pecho alto, espalda neutra y aire comprimido en abdomen.",
      "Empuja el suelo con los pies extendiendo cadera y rodillas a la vez."
    ],
    commonErrors: ["Redondear la espalda lumbar", "Alejar la barra del cuerpo durante el recorrido"]
  },

  // --- BRAZOS ---
  {
    id: "barbell_curl",
    name: "Curl de Bíceps con Barra Recta / Z",
    category: "Brazos",
    subMuscle: "Bíceps",
    type: "heavy",
    typeName: "Barra",
    targetMuscles: ["Bíceps", "Bíceps Cabeza Corta", "Bíceps Cabeza Larga", "Braquial"],
    benefit: "Sobrecarga principal para masa y pico del bíceps braquial.",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Codos pegados a los costados.",
      "Flexiona los brazos sin mover los hombros hasta la contracción total.",
      "Baja en 3 segundos estirando completamente el bíceps."
    ],
    commonErrors: ["Balancear la cadera para iniciar el movimiento", "Mover los codos hacia adelante"]
  },
  {
    id: "skull_crushers",
    name: "Press Francés con Barra Z / Mancuernas",
    category: "Brazos",
    subMuscle: "Tríceps",
    type: "dumbbell",
    typeName: "Barra / Mancuerna",
    targetMuscles: ["Tríceps", "Tríceps Cabeza Larga", "Tríceps Cabeza Medial"],
    benefit: "Excelente trabajo en estiramiento de la cabeza larga del tríceps para máximo volumen de brazo.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Tumbado en banco, brazos verticales.",
      "Flexiona solo los codos llevando el peso hacia la frente o coronilla.",
      "Extiende los antebrazos contrayendo el tríceps con fuerza."
    ],
    commonErrors: ["Abrir los codos excesivamente hacia los laterales", "Mover los hombros durante la repetición"]
  },
  {
    id: "triceps_pushdown",
    name: "Extensiones de Tríceps en Polea Alta",
    category: "Brazos",
    subMuscle: "Tríceps",
    type: "cable",
    typeName: "Polea",
    targetMuscles: ["Tríceps", "Tríceps Cabeza Lateral"],
    benefit: "Aislamiento de la cabeza lateral para dar corte y definición en forma de herradura.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Codos fijos a los lados del torso.",
      "Empuja la barra o cuerda hacia abajo bloqueando los codos.",
      "Regresa controladamente hasta los 90°."
    ],
    commonErrors: ["Separar los codos del cuerpo", "Usar el peso del cuerpo para empujar"]
  },
  {
    id: "farmer_walk_forearms",
    name: "Paseo del Granjero / Dead Hang (Antebrazos)",
    category: "Brazos",
    subMuscle: "Antebrazos",
    type: "heavy",
    typeName: "Carga / Agarre",
    targetMuscles: ["Antebrazos", "Flexores de Muñeca", "Trapecio", "Core"],
    benefit: "Fuerza de agarre descomunal y densidad en los flexores y extensores del antebrazo.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Sujeta dos mancuernas o kettlebells pesadas.",
      "Camina con pasos cortos, pecho erguido y hombros firmes.",
      "Mantén la contracción de las manos durante 30-45 segundos."
    ],
    commonErrors: ["Inclinarse hacia los lados", "Relajar los hombros"]
  },

  // --- PIERNAS ---
  {
    id: "squat_barbell",
    name: "Sentadilla Trasera con Barra",
    category: "Piernas",
    subMuscle: "Cuádriceps",
    type: "heavy",
    typeName: "Barra / Pesado",
    targetMuscles: ["Cuádriceps", "Glúteos", "Adúctores", "Core"],
    benefit: "El pilar de fuerza para el tren inferior. Estimula gran masa muscular y densidad ósea.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Barra sobre trapecios, abdomen apretado.",
      "Desciende flexionando cadera y rodillas hasta romper la paralela.",
      "Empuja el suelo con toda la planta manteniendo rodillas alineadas."
    ],
    commonErrors: ["Colapso de rodillas hacia adentro (valgo)", "Levantar los talones del suelo"]
  },
  {
    id: "bulgarian_split_squat",
    name: "Sentadilla Búlgara con Mancuernas",
    category: "Piernas",
    subMuscle: "Cuádriceps",
    type: "dumbbell",
    typeName: "Mancuerna",
    targetMuscles: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
    benefit: "Corrige asimetrías de fuerza en piernas y genera hipertrofia profunda en cuádriceps y glúteo.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Un pie apoyado atrás en un banco.",
      "Desciende con la pierna delantera hasta que el muslo quede paralelo al suelo.",
      "Empuja con el talón delantero para volver arriba."
    ],
    commonErrors: ["Apoyar demasiado peso en la pierna trasera", "Colocar el pie delantero muy cerca del banco"]
  },
  {
    id: "romanian_deadlift",
    name: "Peso Muerto Rumano con Barra / Mancuernas",
    category: "Piernas",
    subMuscle: "Isquiotibiales",
    type: "heavy",
    typeName: "Barra / Mancuerna",
    targetMuscles: ["Isquiotibiales", "Glúteos", "Lumbares"],
    benefit: "Máxima tensión excéntrica y elongación en los isquiotibiales con bisagra de cadera.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Rodillas semi-flexionadas y fijas durante todo el movimiento.",
      "Lleva la cadera hacia atrás como si quisieras tocar la pared.",
      "Baja la barra rozando las piernas hasta notar el estiramiento en isquios y sube contrayendo glúteos."
    ],
    commonErrors: ["Doblar las rodillas como en una sentadilla", "Curvar la columna al bajar"]
  },
  {
    id: "hip_thrust",
    name: "Hip Thrust con Barra",
    category: "Piernas",
    subMuscle: "Glúteos",
    type: "heavy",
    typeName: "Barra / Pesado",
    targetMuscles: ["Glúteos", "Glúteo Mayor", "Isquiotibiales"],
    benefit: "El ejercicio de mayor activación electromiográfica y sobrecarga para el glúteo mayor.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Espalda alta apoyada en el banco, barra acolchada sobre la pelvis.",
      "Pies al ancho de hombros con rodillas a 90° en la parte alta.",
      "Extiende la cadera completamente contrayendo glúteos 2 segundos arriba."
    ],
    commonErrors: ["Hiperextender la zona lumbar en lugar de mover la cadera", "Colocar los pies demasiado lejos"]
  },
  {
    id: "calf_raises",
    name: "Elevación de Talones de Pie / Sentado",
    category: "Piernas",
    subMuscle: "Pantorrillas",
    type: "heavy",
    typeName: "Aislamiento",
    targetMuscles: ["Pantorrillas", "Gastrocnemio", "Sóleo"],
    benefit: "Desarrollo de volumen y potencia en gemelos y sóleo con rango completo.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Apoya las puntas de los pies sobre un escalón o plataforma.",
      "Baja los talones al máximo estirando la pantorrilla (pausa 1s).",
      "Sube explosivo a la máxima punta de pies (pausa 1s)."
    ],
    commonErrors: ["Rebotar rápido sin pausa", "Recortar el recorrido inferior"]
  },

  // --- CORE ---
  {
    id: "cable_crunch",
    name: "Crunch Abdominal en Polea Alta",
    category: "Core",
    subMuscle: "Abdomen Superior",
    type: "cable",
    typeName: "Polea",
    targetMuscles: ["Abdomen Superior", "Recto Abdominal"],
    benefit: "Permite sobrecarga progresiva real con peso para hipertrofia de los cuadros abdominales.",
    image: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80",
    technique: [
      "De rodillas con la cuerda pegada a las sienes.",
      "Flexiona la columna enrollando el torso hacia la pelvis usando solo el abdomen.",
      "Regresa controladamente sintiendo el estiramiento abdominal."
    ],
    commonErrors: ["Mover la cadera hacia atrás (haciendo sentadilla en vez de flexión espinal)", "Jalar con los brazos"]
  },
  {
    id: "hanging_leg_raises",
    name: "Elevación de Piernas Colgado en Barra",
    category: "Core",
    subMuscle: "Abdomen Inferior",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Abdomen Inferior", "Recto Abdominal", "Flexores de Cadera"],
    benefit: "Máxima activación del recto abdominal inferior y fuerza funcional anti-extensión.",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Colgado de la barra con agarre firme y torso estable.",
      "Eleva las piernas rectas o flexionadas curvando la pelvis hacia el pecho.",
      "Baja lentamente sin balancear el cuerpo."
    ],
    commonErrors: ["Usar balanceo de péndulo con las piernas", "No elevar la pelvis"]
  },
  {
    id: "russian_twist_obliques",
    name: "Giros Rusos / Plancha Lateral",
    category: "Core",
    subMuscle: "Oblicuos",
    type: "bodyweight",
    typeName: "Peso Corporal / Disco",
    targetMuscles: ["Oblicuos", "Transverso del Abdomen"],
    benefit: "Fortalece la rotación y estabilidad lateral del torso protegiendo la columna.",
    image: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Sentado con talones elevados y torso a 45°.",
      "Gira el torso de lado a lado llevando el disco o manos al suelo.",
      "Mantén el abdomen contraído en todo momento."
    ],
    commonErrors: ["Mover solo los brazos sin rotar el torso", "Arquear la espalda baja"]
  },
  {
    id: "plank_core",
    name: "Plancha Abdominal Isométrica",
    category: "Core",
    subMuscle: "Abdomen Superior",
    type: "bodyweight",
    typeName: "Peso Corporal",
    targetMuscles: ["Abdomen Superior", "Abdomen Inferior", "Transverso del Abdomen", "Oblicuos"],
    benefit: "Fortalece la capacidad anti-extensión de la columna, protegiendo la zona lumbar.",
    image: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80",
    technique: [
      "Apoya los antebrazos bajo los hombros y las puntas de los pies.",
      "Aprieta glúteos, abdomen y cuádriceps manteniendo el cuerpo recto como una tabla."
    ],
    commonErrors: ["Hundir la cadera hacia el suelo", "Elevar los glúteos en exceso"]
  }
];

const MUSCLE_TAXONOMY = {
  Hombros: ["Deltoides Anterior", "Deltoides Lateral", "Deltoides Posterior"],
  Pecho: ["Superior", "Medio", "Inferior"],
  Espalda: ["Dorsal Ancho", "Trapecio", "Romboides", "Lumbares"],
  Brazos: ["Bíceps", "Tríceps", "Antebrazos"],
  Piernas: ["Cuádriceps", "Isquiotibiales", "Glúteos", "Pantorrillas"],
  Core: ["Abdomen Superior", "Abdomen Inferior", "Oblicuos"]
};

function getMuscleCategories() {
  return ["Todos", ...Object.keys(MUSCLE_TAXONOMY)];
}

function getSubMusclesForCategory(category) {
  if (!category || category === "Todos") return [];
  return MUSCLE_TAXONOMY[category] || [];
}

function filterExercises(query = "", group = null, subRegion = null) {
  const q = (query || "").trim().toLowerCase();
  return GLOBAL_EXERCISE_CATALOG.filter(ex => {
    const matchQuery =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.category.toLowerCase().includes(q) ||
      (ex.subMuscle && ex.subMuscle.toLowerCase().includes(q)) ||
      ex.targetMuscles.some(m => m.toLowerCase().includes(q));

    const matchGroup = !group || group === "Todos" || ex.category === group;
    const matchSub =
      !subRegion ||
      subRegion === "Todos" ||
      ex.subMuscle === subRegion ||
      ex.targetMuscles.some(m => m.toLowerCase().includes(subRegion.toLowerCase()));

    return matchQuery && matchGroup && matchSub;
  });
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
