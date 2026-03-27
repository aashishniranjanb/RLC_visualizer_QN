// lib/audioEngine.ts
// MEMBER 3 — Audio Sonification
// Converts RLC resonant frequency and damping into audible sound.

class AudioEngine {
  private ctx: AudioContext | null = null

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
  }

  /**
   * Plays a decaying sine wave tone.
   * @param frequency Resonance frequency (Hz)
   * @param decay Damping coefficient alpha (1/s)
   * @param duration Total duration (s)
   */
  public playPulse(frequency: number, decay: number, duration: number = 2) {
    this.init()
    if (!this.ctx) return

    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    // Map circuit parameters to audio
    // We cap frequency to comfortable human ranges [100Hz - 2000Hz]
    const audioFreq = Math.min(2000, Math.max(100, frequency))
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(audioFreq, this.ctx.currentTime)
    
    // Initial volume
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
    
    // Exponential decay: V = V0 * exp(-alpha * t)
    // We map alpha directly to the gain decay ramp
    // Audio API's exponentialRamp expects a non-zero end value
    const endValue = 0.0001
    gain.gain.exponentialRampToValueAtTime(endValue, this.ctx.currentTime + duration)

    // Subtly animate frequency if underdamped (simulating subtle drift/character)
    osc.frequency.exponentialRampToValueAtTime(audioFreq * 0.99, this.ctx.currentTime + duration)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(audioFreq * 2, this.ctx.currentTime)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + duration)
  }
}

export const audioEngine = new AudioEngine()
