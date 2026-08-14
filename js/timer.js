/**
 * AuraFit Pro — Inter-set Rest Timer Module
 * Administra el temporizador entre series con sintetizador Web Audio API,
 * controles de incremento (+15s) y salto inmediato.
 */

class RestTimer {
  constructor() {
    this.timerInterval = null;
    this.remainingSeconds = 0;
    this.totalSeconds = 90;
    this.endsAt = 0;
    this.audioCtx = null;

    // Elementos DOM
    this.overlay = document.getElementById("timerOverlay");
    this.digitsEl = document.getElementById("timerCountdown");
    this.progressFillEl = document.getElementById("timerProgressFill");
    this.btnSkip = document.getElementById("btnSkipRest");
    this.btnAdd15 = document.getElementById("btnAdd15s");

    this.initEvents();
  }

  initEvents() {
    if (this.btnSkip) {
      this.btnSkip.addEventListener("click", () => this.stop());
    }
    if (this.btnAdd15) {
      this.btnAdd15.addEventListener("click", () => this.addTime(15));
    }
  }

  start(seconds = 90) {
    this.remainingSeconds = seconds;
    this.totalSeconds = seconds;
    this.endsAt = Date.now() + seconds * 1000;

    if (this.overlay) {
      this.overlay.classList.remove("hidden");
    }

    this.updateDisplay();

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      // Se calcula contra un reloj real: no pierde segundos si el navegador se ralentiza.
      this.remainingSeconds = Math.max(0, Math.ceil((this.endsAt - Date.now()) / 1000));
      this.updateDisplay();

      if (this.remainingSeconds <= 0) {
        this.onComplete();
      }
    }, 1000);
  }

  addTime(extraSecs) {
    this.remainingSeconds += extraSecs;
    this.totalSeconds += extraSecs;
    this.endsAt += extraSecs * 1000;
    this.updateDisplay();
  }

  stop() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.endsAt = 0;
    if (this.overlay) {
      this.overlay.classList.add("hidden");
    }
  }

  updateDisplay() {
    if (!this.digitsEl || !this.progressFillEl) return;

    const mins = Math.floor(Math.max(0, this.remainingSeconds) / 60)
      .toString()
      .padStart(2, "0");
    const secs = (Math.max(0, this.remainingSeconds) % 60)
      .toString()
      .padStart(2, "0");

    this.digitsEl.textContent = `${mins}:${secs}`;
    const pct = Math.max(0, (this.remainingSeconds / this.totalSeconds) * 100);
    this.progressFillEl.style.width = `${pct}%`;
  }

  onComplete() {
    this.stop();
    this.playChimeSound();
  }

  /**
   * Genera un tono sintetizado seguro mediante Web Audio API sin requerir archivos externos
   */
  playChimeSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }

      const ctx = this.audioCtx;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Secuencia de doble tono de alerta deportiva
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  }
}

// Global instance created after DOM loads
let restTimerInstance = null;
document.addEventListener("DOMContentLoaded", () => {
  restTimerInstance = new RestTimer();
});
