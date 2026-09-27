/**
 * Screen Wake Lock API helper to keep the screen on while training.
 */
class WakeLockService {
  constructor() {
    this.sentinel = null;
    this.isActive = false;
  }

  async request() {
    if ('wakeLock' in navigator) {
      try {
        this.sentinel = await navigator.wakeLock.request('screen');
        this.isActive = true;
        this.sentinel.addEventListener('release', () => {
          this.isActive = false;
          this.sentinel = null;
        });
      } catch (err) {
        console.warn('Wake Lock request error:', err);
      }
    }
  }

  async release() {
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch (err) {
        console.warn('Wake Lock release error:', err);
      }
      this.sentinel = null;
      this.isActive = false;
    }
  }
}

export const wakeLock = new WakeLockService();
