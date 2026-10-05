/**
 * Web Audio API synthesizer for gym sound effects.
 * 100% offline, zero network latency, no external mp3 assets needed.
 */
class SoundService {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playTone(frequency, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(gainVal, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Quick crisp click for completing a set
  playSetComplete() {
    this.playTone(587.33, 'square', 0.15, 0.25); // D5
    setTimeout(() => {
      this.playTone(880, 'sine', 0.25, 0.3); // A5
    }, 120);
  }

  // Warning tick when 3, 2, 1 seconds remain on rest timer
  playCountdownTick() {
    this.playTone(520, 'triangle', 0.12, 0.2);
  }

  // Double celebratory tone when rest timer reaches 0
  playRestFinished() {
    this.playTone(523.25, 'square', 0.2, 0.35); // C5
    setTimeout(() => {
      this.playTone(659.25, 'triangle', 0.2, 0.35); // E5
      setTimeout(() => {
        this.playTone(783.99, 'sine', 0.5, 0.45); // G5
      }, 180);
    }, 180);
  }
}

export const sound = new SoundService();
