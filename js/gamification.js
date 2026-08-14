/**
 * AuraFit Pro — Gamification & Rewards System (gamification.js)
 * REFACTORED: Sistema de "Días Cumplidos & Consistencia" en lugar de racha.
 * Métricas acumulativas: sesiones totales, volumen total, minutos entrenados.
 * Badges por hitos alcanzados, sin castigo por perder un día.
 */

class GamificationEngine {
  constructor() {
    this.STORAGE_KEY = "aurafit_v2_gamification";
    this.state = this.loadState();
  }

  loadState() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.warn("[Gamification] Estado corrupto, reiniciando.", e);
      }
    }

    // Estado inicial limpio — SIN datos fantasma
    return {
      xp: 0,
      totalSessions: 0,        // Sesiones finalizadas acumuladas
      totalKgLifted: 0,        // Volumen total levantado (kg)
      totalMinutes: 0,         // Minutos totales entrenados
      totalCardioKm: 0,        // km de cardio acumulados
      lastWorkoutDate: null,
      unlockedBadges: []       // Sin badges pre-desbloqueados
    };
  }

  saveState() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
  }

  getLevelInfo() {
    const xp = this.state.xp;

    if (xp < 300) {
      return { level: 1, title: "Novato Consistente", nextLevelXP: 300, pct: Math.min(100, Math.floor((xp / 300) * 100)), badgeIcon: "🥉" };
    } else if (xp < 800) {
      return { level: 2, title: "Atleta en Progreso", nextLevelXP: 800, pct: Math.min(100, Math.floor(((xp - 300) / 500) * 100)), badgeIcon: "⚡" };
    } else if (xp < 1800) {
      return { level: 3, title: "Guerrero de Hierro", nextLevelXP: 1800, pct: Math.min(100, Math.floor(((xp - 800) / 1000) * 100)), badgeIcon: "🥇" };
    } else if (xp < 4000) {
      return { level: 4, title: "Master en Sobrecarga", nextLevelXP: 4000, pct: Math.min(100, Math.floor(((xp - 1800) / 2200) * 100)), badgeIcon: "🏆" };
    } else {
      return { level: 5, title: "Leyenda AuraFit Pro", nextLevelXP: xp, pct: 100, badgeIcon: "👑" };
    }
  }

  /**
   * Catálogo de badges acumulativos — hitos, NO racha diaria
   */
  getBadgesCatalog() {
    return [
      {
        id: "first_step",
        icon: "🌱",
        name: "Primer Paso",
        desc: "Completaste tu primera sesión de entrenamiento.",
        unlockCondition: (s) => s.totalSessions >= 1
      },
      {
        id: "steel_10",
        icon: "💪",
        name: "10 Días de Acero",
        desc: "Completaste 10 sesiones de entrenamiento.",
        unlockCondition: (s) => s.totalSessions >= 10
      },
      {
        id: "consistent_athlete",
        icon: "🏅",
        name: "Atleta Consistente",
        desc: "Completaste 25 sesiones. La consistencia es tu superpoder.",
        unlockCondition: (s) => s.totalSessions >= 25
      },
      {
        id: "body_mastery",
        icon: "⚡",
        name: "Dominio Corporal",
        desc: "Completaste 50 sesiones. Eres una máquina imparable.",
        unlockCondition: (s) => s.totalSessions >= 50
      },
      {
        id: "legend_100",
        icon: "👑",
        name: "Leyenda AuraFit",
        desc: "100 sesiones completadas. Una leyenda viviente.",
        unlockCondition: (s) => s.totalSessions >= 100
      },
      {
        id: "titan_volume",
        icon: "🏋️",
        name: "Titán del Volumen",
        desc: "Levantaste más de 10,000 kg en total.",
        unlockCondition: (s) => s.totalKgLifted >= 10000
      },
      {
        id: "cardio_master",
        icon: "🏃",
        name: "Corredor Incansable",
        desc: "Completaste tu primera sesión de cardio.",
        unlockCondition: (s) => s.totalCardioKm > 0
      },
      {
        id: "cardio_50km",
        icon: "🚀",
        name: "50 km Conquistados",
        desc: "Acumulaste 50 km de cardio total.",
        unlockCondition: (s) => s.totalCardioKm >= 50
      }
    ];
  }

  /**
   * Verifica y desbloquea badges por métricas acumulativas
   */
  checkAndUnlockBadges() {
    const catalog = this.getBadgesCatalog();
    let newUnlocks = [];

    catalog.forEach(badge => {
      if (!this.state.unlockedBadges.includes(badge.id) && badge.unlockCondition(this.state)) {
        this.state.unlockedBadges.push(badge.id);
        newUnlocks.push(badge);
      }
    });

    return newUnlocks;
  }

  /**
   * Registra la finalización de un entrenamiento y otorga XP
   * @param {string} type - 'strength' | 'cardio'
   * @param {object} metrics - datos del entrenamiento
   * @returns {object} resultado con XP ganado y estado actualizado
   */
  recordWorkoutCompletion(type, metrics) {
    let xpGained = 50; // XP base por sesión completada

    if (type === "cardio") {
      const km = metrics.distanceKm || 0;
      const minutes = metrics.minutes || 0;
      xpGained += Math.round(km * 20) + Math.round(minutes * 1.5);
      this.state.totalCardioKm += km;
      this.state.totalMinutes += minutes;

    } else {
      // strength / calistenia
      const sets = metrics.completedSets || 0;
      const volume = metrics.totalVolumeKg || 0;
      const minutes = metrics.minutes || 0;
      xpGained += (sets * 12) + Math.round(volume / 40) + Math.round(minutes * 1);
      this.state.totalKgLifted += volume;
      this.state.totalMinutes += minutes;
    }

    this.state.xp += xpGained;
    this.state.totalSessions += 1;
    this.state.lastWorkoutDate = new Date().toISOString().split("T")[0];

    // Verificar nuevos badges
    const newBadges = this.checkAndUnlockBadges();

    this.saveState();

    return {
      xpGained,
      totalSessions: this.state.totalSessions,
      newBadges,
      levelInfo: this.getLevelInfo()
    };
  }
}

// Instancia global exportada
const gamificationEngine = new GamificationEngine();
