/**
 * Safe Web Vibration API helper for tactile haptic feedback in gym.
 */
export function vibrate(pattern = [100]) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors on unsupported platforms
    }
  }
}

export function vibrateSetComplete() {
  vibrate([80]);
}

export function vibrateRestFinished() {
  vibrate([150, 100, 250]);
}
