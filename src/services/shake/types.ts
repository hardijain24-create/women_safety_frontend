/**
 * Shake-to-SOS System Types for Guardian Safety Application
 */

export interface AccelerometerReading {
  x: number; // in g (1g ≈ 9.81 m/s²) or m/s² (handled by normalizer)
  y: number;
  z: number;
  timestamp: number; // epoch timestamp in ms
}

export interface FilteredReading {
  raw: AccelerometerReading;
  gravity: { x: number; y: number; z: number };
  linear: { x: number; y: number; z: number };
  rawMagnitude: number;
  linearMagnitude: number;
  smoothedMagnitude: number;
  timestamp: number;
}

export interface ShakePeak {
  magnitude: number;
  timestamp: number;
  axisDominance?: 'x' | 'y' | 'z';
}

export interface ShakeConfig {
  /** Sampling frequency in Hz (default: 50 Hz -> 20ms update interval) */
  sensorSampleRateHz: number;
  /** Acceleration threshold in g above which a peak is recorded (default: 2.7g) */
  shakeThresholdG: number;
  /** Number of distinct directional peaks required to trigger SOS (default: 3) */
  requiredShakes: number;
  /** Time window in ms within which the required shakes must occur (default: 1000ms) */
  shakeWindowMs: number;
  /** Minimum refractory interval in ms between consecutive peaks (default: 180ms) */
  minPeakIntervalMs: number;
  /** Maximum interval in ms between consecutive peaks to maintain rhythm (default: 600ms) */
  maxPeakIntervalMs: number;
  /** Cooldown duration in ms after SOS is triggered or cancelled before re-arming (default: 8000ms) */
  sosCooldownMs: number;
  /** Countdown duration in seconds allowing the user to cancel false triggers (default: 3s) */
  sosCountdownSeconds: number;
  /** Alpha parameter for dynamic gravity low-pass filter: g_t = α * g_{t-1} + (1 - α) * a_t (default: 0.8) */
  gravityFilterAlpha: number;
  /** Size of moving average window for noise reduction (default: 3) */
  smoothingWindowSize: number;
  /** Enable debug diagnostics logging */
  debugLogging: boolean;
}

export type SOSState = 
  | 'IDLE'             // Monitoring accelerometer
  | 'SHAKE_DETECTED'   // 3 peaks reached, preparing countdown
  | 'COUNTDOWN'        // 3-second active cancellation window with modal UI
  | 'TRIGGERED'        // Countdown elapsed, SOS payload dispatched to backend/contacts
  | 'CANCELLED'        // Cancelled by user before countdown reached 0
  | 'COOLDOWN';        // Disarmed temporarily to avoid repeated activation

export interface SOSEventPayload {
  userId: string;
  sosEventId: string; // UUID v4
  timestamp: string; // ISO 8601 string
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
    altitude?: number | null;
    speed?: number | null;
  };
  deviceInfo: {
    platform: 'android' | 'ios' | 'web' | 'unknown';
    model?: string;
    osVersion?: string;
    batteryLevel?: number;
    isCharging?: boolean;
  };
  triggerType: 'SHAKE' | 'MANUAL' | 'BAND' | 'FALL_DETECTION';
  sosStatus: 'TRIGGERED' | 'CONFIRMED' | 'CANCELLED' | 'RESOLVED';
  metadata: {
    peakCount: number;
    maxPeakG: number;
    shakeDurationMs: number;
    confidenceScore: number;
    configuredThresholdG: number;
  };
}

export interface ShakeDebugLog {
  timestamp: number;
  rawX: number;
  rawY: number;
  rawZ: number;
  rawMagnitude: number;
  linearMagnitude: number;
  smoothedMagnitude: number;
  peakCount: number;
  recentPeaks: ShakePeak[];
  confidence: number;
  state: SOSState;
}

export type ShakeDetectionCallback = (details: {
  peakCount: number;
  maxPeakG: number;
  shakeDurationMs: number;
  confidence: number;
}) => void;

export type SOSStateChangeCallback = (state: SOSState, remainingCountdownSeconds?: number) => void;
