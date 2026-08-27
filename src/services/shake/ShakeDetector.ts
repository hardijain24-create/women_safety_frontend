import {
  AccelerometerReading,
  FilteredReading,
  ShakeConfig,
  ShakePeak,
  ShakeDebugLog,
  ShakeDetectionCallback,
} from './types';
import { DEFAULT_SHAKE_CONFIG, createShakeConfig } from './config';

/**
 * ShakeDetector
 *
 * Core algorithmic engine for detecting intentional shaking patterns while filtering out
 * environmental noise, gravity, phone drops, vehicle vibrations, walking, and running.
 *
 * Designed with ZERO UI / React dependencies for 100% testability across platforms.
 */
export class ShakeDetector {
  private config: ShakeConfig;
  private gravity = { x: 0, y: 0, z: 0 };
  private gravityInitialized = false;

  // Smoothing buffer
  private smoothingBuffer: number[] = [];

  // Recent detected peaks within the sliding window
  private recentPeaks: ShakePeak[] = [];
  private lastPeakTime = 0;

  // Peak tracking state
  private isCurrentlyInPeak = false;
  private currentPeakMaxMagnitude = 0;
  private currentPeakTime = 0;

  // Registered callbacks
  private shakeCallbacks: ShakeDetectionCallback[] = [];
  private debugLogCallbacks: ((log: ShakeDebugLog) => void)[] = [];

  // Last debug snapshot
  private lastDebugLog: ShakeDebugLog | null = null;

  constructor(config?: Partial<ShakeConfig>) {
    this.config = createShakeConfig(config);
  }

  /**
   * Update detector configuration dynamically
   */
  public updateConfig(newConfig: Partial<ShakeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.smoothingBuffer.length > this.config.smoothingWindowSize) {
      this.smoothingBuffer = this.smoothingBuffer.slice(-this.config.smoothingWindowSize);
    }
  }

  /**
   * Get the current active configuration
   */
  public getConfig(): Readonly<ShakeConfig> {
    return { ...this.config };
  }

  /**
   * Register a listener called when a valid 3-shake pattern is confirmed
   */
  public onShakeDetected(callback: ShakeDetectionCallback): () => void {
    this.shakeCallbacks.push(callback);
    return () => {
      this.shakeCallbacks = this.shakeCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Register an optional debug logger callback
   */
  public onDebugLog(callback: (log: ShakeDebugLog) => void): () => void {
    this.debugLogCallbacks.push(callback);
    return () => {
      this.debugLogCallbacks = this.debugLogCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Primary Entry Point: Process a single accelerometer reading (expected at ~50 Hz)
   *
   * @param reading Raw x, y, z acceleration reading and timestamp
   * @param isLinear Set to true if the input has already been gravity-compensated
   * @returns true if a valid shake pattern triggered SOS on this sample, false otherwise
   */
  public processSample(reading: AccelerometerReading, isLinear = false): boolean {
    const { x, y, z, timestamp } = reading;

    // 1. Gravity Removal / Linear Acceleration Isolation
    let linearX: number;
    let linearY: number;
    let linearZ: number;

    if (isLinear) {
      linearX = x;
      linearY = y;
      linearZ = z;
    } else {
      if (!this.gravityInitialized) {
        this.gravity.x = x;
        this.gravity.y = y;
        this.gravity.z = z;
        this.gravityInitialized = true;
      } else {
        const alpha = this.config.gravityFilterAlpha;
        // Low-pass filter tracks static gravity
        this.gravity.x = alpha * this.gravity.x + (1 - alpha) * x;
        this.gravity.y = alpha * this.gravity.y + (1 - alpha) * y;
        this.gravity.z = alpha * this.gravity.z + (1 - alpha) * z;
      }

      // High-pass filter removes gravity
      linearX = x - this.gravity.x;
      linearY = y - this.gravity.y;
      linearZ = z - this.gravity.z;
    }

    // 2. Magnitude Calculation
    const rawMagnitude = Math.sqrt(x * x + y * y + z * z);
    const linearMagnitude = Math.sqrt(
      linearX * linearX + linearY * linearY + linearZ * linearZ
    );

    // 3. Noise Smoothing via Moving Average
    this.smoothingBuffer.push(linearMagnitude);
    if (this.smoothingBuffer.length > this.config.smoothingWindowSize) {
      this.smoothingBuffer.shift();
    }
    const smoothedMagnitude =
      this.smoothingBuffer.reduce((sum, val) => sum + val, 0) /
      this.smoothingBuffer.length;

    // 4. Evict expired peaks from sliding window
    this.evictExpiredPeaks(timestamp);

    // 5. Peak & Rhythm Detection
    let shakeTriggered = false;

    if (smoothedMagnitude >= this.config.shakeThresholdG) {
      if (!this.isCurrentlyInPeak) {
        // Start of a potential peak
        const timeSinceLastPeak = timestamp - this.lastPeakTime;

        if (this.lastPeakTime === 0 || timeSinceLastPeak >= this.config.minPeakIntervalMs) {
          // Check rhythm consistency if there were prior peaks
          const isRhythmValid =
            this.recentPeaks.length === 0 ||
            timeSinceLastPeak <= this.config.maxPeakIntervalMs;

          if (!isRhythmValid) {
            // Gap was too long; reset peak buffer to start fresh from this peak
            this.recentPeaks = [];
          }

          const newPeak: ShakePeak = {
            magnitude: smoothedMagnitude,
            timestamp,
            axisDominance: this.getDominantAxis(linearX, linearY, linearZ),
          };

          this.recentPeaks.push(newPeak);
          this.lastPeakTime = timestamp;
          this.isCurrentlyInPeak = true;
          this.currentPeakMaxMagnitude = smoothedMagnitude;
          this.currentPeakTime = timestamp;

          // Check if required peaks reached within sliding window
          if (this.recentPeaks.length >= this.config.requiredShakes) {
            const confidence = this.calculateConfidence(this.recentPeaks);
            const shakeDurationMs =
              this.recentPeaks[this.recentPeaks.length - 1].timestamp -
              this.recentPeaks[0].timestamp;
            const maxPeakG = Math.max(...this.recentPeaks.map(p => p.magnitude));

            this.notifyShakeDetected({
              peakCount: this.recentPeaks.length,
              maxPeakG,
              shakeDurationMs,
              confidence,
            });

            shakeTriggered = true;
            this.recentPeaks = [];
            this.lastPeakTime = 0;
            this.isCurrentlyInPeak = false;
          }
        } else {
          // Inside refractory window: ignore sub-oscillation as part of the same physical stroke
          this.isCurrentlyInPeak = true;
        }
      } else {
        // Continue tracking max within the active peak
        if (smoothedMagnitude > this.currentPeakMaxMagnitude) {
          this.currentPeakMaxMagnitude = smoothedMagnitude;
        }
      }
    } else {
      // Signal fell below threshold
      if (this.isCurrentlyInPeak) {
        this.isCurrentlyInPeak = false;
      }
    }

    // 6. Debug Diagnostics Logging (if enabled)
    if (this.config.debugLogging || this.debugLogCallbacks.length > 0) {
      const debugLog: ShakeDebugLog = {
        timestamp,
        rawX: Number(x.toFixed(3)),
        rawY: Number(y.toFixed(3)),
        rawZ: Number(z.toFixed(3)),
        rawMagnitude: Number(rawMagnitude.toFixed(3)),
        linearMagnitude: Number(linearMagnitude.toFixed(3)),
        smoothedMagnitude: Number(smoothedMagnitude.toFixed(3)),
        peakCount: this.recentPeaks.length,
        recentPeaks: [...this.recentPeaks],
        confidence: this.recentPeaks.length > 0 ? this.calculateConfidence(this.recentPeaks) : 0,
        state: shakeTriggered ? 'SHAKE_DETECTED' : 'IDLE',
      };
      this.lastDebugLog = debugLog;
      this.notifyDebugLog(debugLog);
    }

    return shakeTriggered;
  }

  /**
   * Evicts peaks outside the sliding time window
   */
  private evictExpiredPeaks(currentTimestamp: number): void {
    const cutoff = currentTimestamp - this.config.shakeWindowMs;
    this.recentPeaks = this.recentPeaks.filter(p => p.timestamp >= cutoff);
    if (this.recentPeaks.length === 0) {
      this.lastPeakTime = 0;
    }
  }

  /**
   * Calculates confidence score (0.0 - 1.0) based on:
   * - Peak magnitude consistency above threshold
   * - Peak interval rhythm regularity
   */
  private calculateConfidence(peaks: ShakePeak[]): number {
    if (peaks.length < 2) return 0.5;

    const avgMagnitude =
      peaks.reduce((sum, p) => sum + p.magnitude, 0) / peaks.length;
    const magFactor = Math.min(
      1.0,
      (avgMagnitude - this.config.shakeThresholdG) / 1.5 + 0.6
    );

    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i].timestamp - peaks[i - 1].timestamp);
    }
    const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;
    const variance =
      intervals.reduce((s, v) => s + Math.pow(v - avgInterval, 2), 0) /
      intervals.length;
    const stdDev = Math.sqrt(variance);

    const intervalFactor = Math.max(0.4, 1.0 - stdDev / 200);

    return Number(Math.min(1.0, Math.max(0.1, (magFactor + intervalFactor) / 2)).toFixed(2));
  }

  /**
   * Determines dominant direction of movement
   */
  private getDominantAxis(lx: number, ly: number, lz: number): 'x' | 'y' | 'z' {
    const ax = Math.abs(lx);
    const ay = Math.abs(ly);
    const az = Math.abs(lz);
    if (ax >= ay && ax >= az) return 'x';
    if (ay >= ax && ay >= az) return 'y';
    return 'z';
  }

  private notifyShakeDetected(details: {
    peakCount: number;
    maxPeakG: number;
    shakeDurationMs: number;
    confidence: number;
  }): void {
    for (const callback of this.shakeCallbacks) {
      try {
        callback(details);
      } catch (err) {
        console.error('Error in ShakeDetector callback:', err);
      }
    }
  }

  private notifyDebugLog(log: ShakeDebugLog): void {
    for (const callback of this.debugLogCallbacks) {
      try {
        callback(log);
      } catch (_) {}
    }
  }

  /**
   * Resets all internal buffers, peaks, and gravity vectors
   */
  public reset(): void {
    this.gravity = { x: 0, y: 0, z: 0 };
    this.gravityInitialized = false;
    this.smoothingBuffer = [];
    this.recentPeaks = [];
    this.lastPeakTime = 0;
    this.isCurrentlyInPeak = false;
    this.currentPeakMaxMagnitude = 0;
    this.currentPeakTime = 0;
  }

  /**
   * Current count of active peaks in the sliding window
   */
  public getRecentPeaks(): ReadonlyArray<ShakePeak> {
    return [...this.recentPeaks];
  }

  /**
   * Returns latest debug log snapshot if available
   */
  public getLastDebugLog(): ShakeDebugLog | null {
    return this.lastDebugLog;
  }
}
