/**
 * AuraFit Pro — Cardio & Aerobic High-Performance Engine (cardio.js)
 * Cronómetro de alta precisión basado en marcas de tiempo (Date.now()) sin desfase por suspensión,
 * cálculo dinámico de Ritmo (Pace min/km), Velocidad (km/h), Zonas de Frecuencia Cardíaca (Z1-Z5),
 * calorías metabólicas (MET) y audio cues integrados.
 */

class CardioManager {
  constructor() {
    this.timerInterval = null;
    this.startTime = 0;
    this.accumulatedTime = 0; // Tiempo en ms acumulado en pausas
    this.isRunning = false;

    this.selectedActivity = "Carrera en Campo";
    this.distanceKm = 3.5;
    this.weightKg = 72;
    this.rpeValue = 7;
    this.laps = [];

    this.STORAGE_KEY = "aurafit_saas_cardio_history";
  }

  /**
   * Inicia o reanuda el cronómetro de alta precisión
   */
  startStopwatch(onTick) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();

    this.playTone(880, 0.1); // Beep de inicio

    this.timerInterval = setInterval(() => {
      const currentElapsedMs = this.accumulatedTime + (Date.now() - this.startTime);
      const totalSeconds = Math.floor(currentElapsedMs / 1000);

      if (onTick) {
        onTick(this.formatTimeMs(currentElapsedMs), totalSeconds, this.getSpeedKmH(totalSeconds), this.getZoneInfo());
      }
    }, 200); // 5 actualizaciones por segundo para máxima fluidez
  }

  /**
   * Pausa el cronómetro y almacena el tiempo acumulado
   */
  pauseStopwatch() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.accumulatedTime += Date.now() - this.startTime;
    clearInterval(this.timerInterval);
    this.playTone(440, 0.15); // Beep de pausa
  }

  /**
   * Reinicia completamente el cronómetro
   */
  resetStopwatch() {
    this.pauseStopwatch();
    this.accumulatedTime = 0;
    this.startTime = 0;
    this.laps = [];
  }

  /**
   * Obtiene los segundos totales transcurridos de forma exacta
   */
  getTotalElapsedSeconds() {
    if (this.isRunning) {
      return Math.floor((this.accumulatedTime + (Date.now() - this.startTime)) / 1000);
    }
    return Math.floor(this.accumulatedTime / 1000);
  }

  /**
   * Formatea milisegundos a formato digital HH:MM:SS o MM:SS
   */
  formatTimeMs(ms) {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Calcula el ritmo medio (Pace) en min/km
   */
  calculatePace(distanceKm, totalSeconds = this.getTotalElapsedSeconds()) {
    if (!distanceKm || distanceKm <= 0 || totalSeconds <= 0) return "--:--";

    const paceSecondsTotal = Math.round(totalSeconds / distanceKm);
    const paceMins = Math.floor(paceSecondsTotal / 60);
    const paceSecs = paceSecondsTotal % 60;

    return `${paceMins}:${paceSecs.toString().padStart(2, "0")}`;
  }

  /**
   * Calcula la velocidad en km/h
   */
  getSpeedKmH(totalSeconds = this.getTotalElapsedSeconds(), distanceKm = this.distanceKm) {
    if (!distanceKm || distanceKm <= 0 || totalSeconds <= 0) return "0.0";
    const hours = totalSeconds / 3600;
    return (distanceKm / hours).toFixed(1);
  }

  /**
   * Determina la zona aeróbica de entrenamiento según el RPE y el ritmo
   */
  getZoneInfo(rpe = this.rpeValue) {
    if (rpe <= 3) {
      return { zone: "Z1", name: "Recuperación Activa", color: "#10B981", desc: "Regeneración metabólica y calentamiento" };
    } else if (rpe <= 5) {
      return { zone: "Z2", name: "Base Aeróbica", color: "#38BDF8", desc: "Quema máxima de grasas y resistencia de base" };
    } else if (rpe <= 7) {
      return { zone: "Z3", name: "Tempo / Resistencia", color: "#F59E0B", desc: "Desarrollo de capacidad aeróbica y capilarización" };
    } else if (rpe <= 8) {
      return { zone: "Z4", name: "Umbral Anaeróbico", color: "#F97316", desc: "Tolerancia a lactato y ritmo de competición" };
    } else {
      return { zone: "Z5", name: "Potencia / VO2 Máx", color: "#EC4899", desc: "Esfuerzo casi máximo y sprints" };
    }
  }

  /**
   * Estima calorías quemadas según MET de la actividad, peso corporal y duración
   */
  estimateCalories(activity, durationMins = (this.getTotalElapsedSeconds() / 60), weightKg = this.weightKg) {
    let met = 8.5;
    const act = (activity || this.selectedActivity).toLowerCase();

    if (act.includes("caminata")) met = 4.0;
    if (act.includes("ciclismo")) met = 8.0;
    if (act.includes("hiit")) met = 11.5;
    if (act.includes("carrera") || act.includes("cinta")) met = 10.0;

    const hours = durationMins / 60;
    return Math.round(met * Math.max(30, Number(weightKg) || 72) * hours);
  }

  /**
   * Registra una vuelta o split en la sesión activa
   */
  recordLap() {
    const elapsedSecs = this.getTotalElapsedSeconds();
    const lapNum = this.laps.length + 1;
    const lapData = {
      lap: lapNum,
      timestamp: this.formatTimeMs(elapsedSecs * 1000),
      distance: this.distanceKm,
      pace: this.calculatePace(this.distanceKm, elapsedSecs)
    };
    this.laps.push(lapData);
    this.playTone(1046.5, 0.08); // High C6 tone
    return lapData;
  }

  /**
   * Sonidos táctiles de cronómetro mediante Web Audio API
   */
  playTone(freq = 880, duration = 0.1) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignorar restricciones de audio del navegador
    }
  }

  /**
   * Guarda una sesión de cardio en la base de datos
   */
  async saveCardioSession(data) {
    const totalSeconds = this.getTotalElapsedSeconds();
    const session = {
      id: `cardio-${Date.now()}`,
      timestamp: new Date().toISOString(),
      activity: data.activity || this.selectedActivity,
      durationSeconds: totalSeconds,
      formattedTime: this.formatTimeMs(totalSeconds * 1000),
      distanceKm: Math.max(0.01, Number(data.distanceKm) || this.distanceKm),
      speedKmH: this.getSpeedKmH(totalSeconds, Math.max(0.01, Number(data.distanceKm) || this.distanceKm)),
      paceMinKm: this.calculatePace(Math.max(0.01, Number(data.distanceKm) || this.distanceKm), totalSeconds),
      caloriesBurned: this.estimateCalories(data.activity || this.selectedActivity, totalSeconds / 60, data.weightKg || this.weightKg),
      rpe: Math.min(10, Math.max(1, Number(data.rpe) || this.rpeValue)),
      zone: this.getZoneInfo(Math.min(10, Math.max(1, Number(data.rpe) || this.rpeValue))),
      laps: [...this.laps]
    };

    await dbAdapter.logWorkoutSession({ type: "cardio", ...session });
    this.resetStopwatch();
    return session;
  }
}

// Instancia global exportada
const cardioManager = new CardioManager();
