export class SoundManager {
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.context = new AudioContext();
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.enabled || !this.context) return;

    try {
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.volume, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.context.currentTime + duration
      );

      oscillator.start(this.context.currentTime);
      oscillator.stop(this.context.currentTime + duration);
    } catch (error) {
      // Silently fail if audio can't play
      console.warn('Audio playback failed:', error);
    }
  }

  playShoot(): void {
    this.playTone(800, 0.1, 'square');
  }

  playHit(): void {
    this.playTone(400, 0.15, 'sawtooth');
  }

  playKill(): void {
    if (!this.enabled || !this.context) return;

    // Two-tone death sound
    this.playTone(200, 0.2, 'square');
    setTimeout(() => this.playTone(100, 0.3, 'sawtooth'), 50);
  }

  playDamage(): void {
    this.playTone(150, 0.2, 'triangle');
  }

  playPickup(): void {
    if (!this.enabled || !this.context) return;

    // Rising tone for pickup
    this.playTone(600, 0.1, 'sine');
    setTimeout(() => this.playTone(900, 0.1, 'sine'), 50);
  }

  playLevelComplete(): void {
    if (!this.enabled || !this.context) return;

    // Success jingle
    const notes = [523, 659, 784, 1047]; // C, E, G, C
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine'), i * 100);
    });
  }

  playGameOver(): void {
    if (!this.enabled || !this.context) return;

    // Descending sad tone
    const notes = [440, 392, 349, 294]; // A, G, F, D
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'triangle'), i * 150);
    });
  }
}
