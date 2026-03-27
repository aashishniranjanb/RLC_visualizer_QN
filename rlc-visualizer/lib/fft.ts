// lib/fft.ts
// MEMBER 1 — FFT Implementation for Phase 2

interface Complex {
  re: number
  im: number
}

function nextPow2(n: number): number {
  let p = 1
  while (p < n) p *= 2
  return p
}

/**
 * Recursive Cooley-Tukey FFT implementation
 * O(N log N) complexity
 */
function fftRecursive(x: Complex[]): Complex[] {
  const N = x.length
  if (N <= 1) return x

  // Separate even and odd indices
  const even = fftRecursive(x.filter((_, i) => i % 2 === 0))
  const odd = fftRecursive(x.filter((_, i) => i % 2 !== 0))

  const result: Complex[] = new Array(N)
  for (let k = 0; k < N / 2; k++) {
    const angle = (-2 * Math.PI * k) / N
    const exp = {
      re: Math.cos(angle),
      im: Math.sin(angle)
    }

    // T = exp * odd[k]
    const T = {
      re: exp.re * odd[k].re - exp.im * odd[k].im,
      im: exp.re * odd[k].im + exp.im * odd[k].re
    }

    result[k] = {
      re: even[k].re + T.re,
      im: even[k].im + T.im
    }
    result[k + N / 2] = {
      re: even[k].re - T.re,
      im: even[k].im - T.im
    }
  }

  return result
}

/**
 * Computes FFT of a real signal.
 * Returns positive frequencies and their magnitudes.
 */
export function computeFFT(signal: number[], dt: number): { frequencies: number[], magnitudes: number[] } {
  // Pad to power of 2
  const N = nextPow2(signal.length)
  const padded: Complex[] = new Array(N)
  for (let i = 0; i < N; i++) {
    padded[i] = {
      re: signal[i] ?? 0,
      im: 0
    }
  }

  const fftResult = fftRecursive(padded)
  
  const sampleRate = 1 / dt
  const frequencies: number[] = []
  const magnitudes: number[] = []

  // Return only the first N/2 components (Nyquist limit)
  for (let i = 0; i < N / 2; i++) {
    frequencies.push((i * sampleRate) / N)
    // Magnitude normalized by N
    const mag = Math.sqrt(fftResult[i].re ** 2 + fftResult[i].im ** 2) / N
    magnitudes.push(mag)
  }

  return { frequencies, magnitudes }
}
