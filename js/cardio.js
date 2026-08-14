/**
 * AuraFit Pro — Cardio & Aerobic High-Performance Engine (cardio.js)
 */

const CARDIO_ACTIVITIES = [
  { id: "carrera", label: "🏃 Carrera", name: "Carrera en Campo", met: 10, needsDistance: true },
  { id: "cinta", label: "🏃‍♂️ Cinta", name: "Cinta de Correr", met: 10, needsDistance: true },
  { id: "ciclismo", label: "🚴 Ciclismo", name: "Ciclismo", met: 8.5, needsDistance: true },
  { id: "hiit", label: "⚡ HIIT", name: "HIIT Aeróbico", met: 11.5, needsDistance: false, intervalMode: true },
  { id: "caminata", label: "🚶 Caminata", name: "Caminata", met: 4.2, needsDistance: true },
  { id: "eliptica", label: "🔄 Elíptica", name: "Elíptica", met: 7.5, needsDistance: false },
  { id: "remo", label: "🚣 Remo", name: "Remo", met: 9, needsDistance: false },
  { id: "soga", label: "🪢 Soga", name: "Soga / Comba", met: 12, needsDistance: false },
  { id: "patinaje", label: "⛸ Patinaje", name: "Patinaje", met: 7.5, needsDistance: true },
  { id: "escaleras", label: "🪜 Escaleras", name: "Sube-Escaleras", met: 9, needsDistance: false },
  { id: "natacion", label: "🏊 Natación", name: "Natación", met: 8, needsDistance: false },
  { id: "boxeo", label: "🥊 Boxeo", name: "Boxeo / Saco", met: 10, needsDistance: false }
];

class CardioManager {
  constructor() {
    this.timerInterval = null;
    this.hiitTimeout = null;
    this.startTime = 0;
    this.accumulatedTime = 0;
    this.isRunning = false;
    this.isActiveWorkout = false;
    this.isPaused = false;

    this.selectedActivity = CARDIO_ACTIVITIES[0].name;
    this.selectedActivityMeta = CARDIO_ACTIVITIES[0];
    this.distanceKm = 3.5;
    this.weightKg = 72;
    this.rpeValue = 7;
    this.laps = [];

    this.hiitPhase = "work";
    this.hiitRound = 1;
    this.hiitTotalRounds = 8;
    this.hiitWorkSec = 40;
    this.hiitRestSec = 20;
    this.hiitRemainingSec = 0;

    this.STORAGE_KEY = "aurafit_saas_cardio_history";
  }

  getActivityMeta(name = this.selectedActivity) {
    return CARDIO_ACTIVITIES.find(a => a.name === name || a.id === name) || CARDIO_ACTIVITIES[0];
  }

  needsDistance() {
    return Boolean(this.getActivityMeta().needsDistance);
  }

  isHiit() {
    return Boolean(this.getActivityMeta().intervalMode);
  }

  startStopwatch(onTick) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isActiveWorkout = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.playTone(880, 0.1);

    this.timerInterval = setInterval(() => {
      const currentElapsedMs = this.accumulatedTime + (Date.now() - this.startTime);
      const totalSeconds = Math.floor(currentElapsedMs / 1000);
      if (onTick) {
        onTick(this.formatTimeMs(currentElapsedMs), totalSeconds, this.getSpeedKmH(totalSeconds), this.getZoneInfo());
      }
    }, 200);
  }

  pauseStopwatch() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.isPaused = true;
    this.accumulatedTime += Date.now() - this.startTime;
    clearInterval(this.timerInterval);
    if (this.hiitTimeout) {
      clearTimeout(this.hiitTimeout);
      this.hiitTimeout = null;
    }
    this.playTone(440, 0.15);
  }

  resumeStopwatch(onTick) {
    if (this.isRunning || !this.isPaused) return;
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.playTone(880, 0.1);

    this.timerInterval = setInterval(() => {
      const currentElapsedMs = this.accumulatedTime + (Date.now() - this.startTime);
      const totalSeconds = Math.floor(currentElapsedMs / 1000);
      if (onTick) onTick(this.formatTimeMs(currentElapsedMs), totalSeconds, this.getSpeedKmH(totalSeconds), this.getZoneInfo());
    }, 200);

    if (this.isHiit() && this.hiitRemainingSec > 0) {
      this._scheduleHiitTick(onTick);
    }
  }

  resetStopwatch() {
    this.pauseStopwatch();
    this.accumulatedTime = 0;
    this.startTime = 0;
    this.isPaused = false;
    this.isActiveWorkout = false;
    this.laps = [];
    this.hiitPhase = "work";
    this.hiitRound = 1;
    this.hiitRemainingSec = 0;
    if (this.hiitTimeout) {
      clearTimeout(this.hiitTimeout);
      this.hiitTimeout = null;
    }
  }

  startHiit(onPhaseChange, onTick) {
    this.hiitPhase = "work";
    this.hiitRound = 1;
    this.hiitRemainingSec = this.hiitWorkSec;
    this.startStopwatch(onTick);
    if (onPhaseChange) onPhaseChange(this.getHiitState());
    this._scheduleHiitTick(onTick, onPhaseChange);
  }

  _scheduleHiitTick(onTick, onPhaseChange) {
    if (this.hiitTimeout) clearTimeout(this.hiitTimeout);
    if (!this.isRunning) return;

    this.hiitTimeout = setTimeout(() => {
      if (!this.isRunning) return;
      this.hiitRemainingSec -= 1;

      if (this.hiitRemainingSec <= 0) {
        if (this.hiitPhase === "work") {
          this.hiitPhase = "rest";
          this.hiitRemainingSec = this.hiitRestSec;
          this.playTone(660, 0.12);
        } else {
          this.hiitRound += 1;
          if (this.hiitRound > this.hiitTotalRounds) {
            this.pauseStopwatch();
            if (onPhaseChange) onPhaseChange({ ...this.getHiitState(), complete: true });
            this.playTone(1046.5, 0.2);
            return;
          }
          this.hiitPhase = "work";
          this.hiitRemainingSec = this.hiitWorkSec;
          this.playTone(880, 0.12);
        }
      }

      if (onPhaseChange) onPhaseChange(this.getHiitState());
      this._scheduleHiitTick(onTick, onPhaseChange);
    }, 1000);
  }

  getHiitState() {
    return {
      phase: this.hiitPhase,
      round: this.hiitRound,
      totalRounds: this.hiitTotalRounds,
      remainingSec: this.hiitRemainingSec,
      label: this.hiitPhase === "work" ? "TRABAJO" : "DESCANSO"
    };
  }

  getTotalElapsedSeconds() {
    if (this.isRunning) {
      return Math.floor((this.accumulatedTime + (Date.now() - this.startTime)) / 1000);
    }
    return Math.floor(this.accumulatedTime / 1000);
  }

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

  calculatePace(distanceKm, totalSeconds = this.getTotalElapsedSeconds()) {
    if (!distanceKm || distanceKm <= 0 || totalSeconds <= 0) return "--:--";
    const paceSecondsTotal = Math.round(totalSeconds / distanceKm);
    const paceMins = Math.floor(paceSecondsTotal / 60);
    const paceSecs = paceSecondsTotal % 60;
    return `${paceMins}:${paceSecs.toString().padStart(2, "0")}`;
  }

  getSpeedKmH(totalSeconds = this.getTotalElapsedSeconds(), distanceKm = this.distanceKm) {
    if (!distanceKm || distanceKm <= 0 || totalSeconds <= 0) return "0.0";
    const hours = totalSeconds / 3600;
    return (distanceKm / hours).toFixed(1);
  }

  getZoneInfo(rpe = this.rpeValue) {
    if (rpe <= 3) return { zone: "Z1", name: "Recuperación Activa", color: "#10B981", desc: "Regeneración metabólica" };
    if (rpe <= 5) return { zone: "Z2", name: "Base Aeróbica", color: "#38BDF8", desc: "Resistencia de base" };
    if (rpe <= 7) return { zone: "Z3", name: "Tempo / Resistencia", color: "#F59E0B", desc: "Capacidad aeróbica" };
    if (rpe <= 8) return { zone: "Z4", name: "Umbral Anaeróbico", color: "#F97316", desc: "Ritmo de competición" };
    return { zone: "Z5", name: "Potencia / VO2 Máx", color: "#EC4899", desc: "Esfuerzo máximo" };
  }

  estimateCalories(activity, durationMins = (this.getTotalElapsedSeconds() / 60), weightKg = this.weightKg) {
    const meta = this.getActivityMeta(activity);
    const met = meta?.met || 8.5;
    const hours = durationMins / 60;
    return Math.round(met * Math.max(30, Number(weightKg) || 72) * hours);
  }

  recordLap() {
    const elapsedSecs = this.getTotalElapsedSeconds();
    const lapData = {
      lap: this.laps.length + 1,
      timestamp: this.formatTimeMs(elapsedSecs * 1000),
      distance: this.distanceKm,
      pace: this.calculatePace(this.distanceKm, elapsedSecs)
    };
    this.laps.push(lapData);
    this.playTone(1046.5, 0.08);
    return lapData;
  }

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
    } catch (e) { /* ignore */ }
  }

  async saveCardioSession(data) {
    const totalSeconds = this.getTotalElapsedSeconds();
    const dist = Math.max(0, Number(data.distanceKm) || this.distanceKm);
    const session = {
      id: `cardio-${Date.now()}`,
      timestamp: new Date().toISOString(),
      activity: data.activity || this.selectedActivity,
      durationSeconds: totalSeconds,
      formattedTime: this.formatTimeMs(totalSeconds * 1000),
      distanceKm: dist,
      speedKmH: dist > 0 ? this.getSpeedKmH(totalSeconds, dist) : "0.0",
      paceMinKm: dist > 0 ? this.calculatePace(dist, totalSeconds) : "--:--",
      caloriesBurned: this.estimateCalories(data.activity || this.selectedActivity, totalSeconds / 60, data.weightKg || this.weightKg),
      rpe: Math.min(10, Math.max(1, Number(data.rpe) || this.rpeValue)),
      zone: this.getZoneInfo(Math.min(10, Math.max(1, Number(data.rpe) || this.rpeValue))),
      laps: [...this.laps]
    };

    await dbAdapter.logWorkoutSession({ type: "cardio", ...session });
    this.resetStopwatch();
    this.isActiveWorkout = false;
    return session;
  }
}

const cardioManager = new CardioManager();
