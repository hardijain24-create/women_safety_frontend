import { ShakeConfig } from './types';

/**
 * Default Shake-to-SOS Configuration Parameters for Guardian
 *
 * Calibration Notes:
 * - 50 Hz ensures reliable peak detection without draining battery excessively.
 * - SHAKE_THRESHOLD_G is set to 2.7g initially, requiring deliberate, vigorous physical shaking.
 * - MIN_PEAK_INTERVAL_MS (180ms) prevents recording the back-and-forth swing of the SAME stroke.
 * - REQUIRED_SHAKES = 3 within 1000ms rejects isolated drops, table impacts, and running gait.
 */
export const DEFAULT_SHAKE_CONFIG: ShakeConfig = {
  sensorSampleRateHz: 50,          // 50 Hz (20ms interval)
  shakeThresholdG: 2.7,            // 2.7g peak magnitude (configurable 2.0g - 4.0g)
  requiredShakes: 3,               // 3 distinct peaks
  shakeWindowMs: 1000,             // 1 second sliding window
  minPeakIntervalMs: 180,          // 180ms minimum between distinct peaks (refractory period)
  maxPeakIntervalMs: 600,          // 600ms maximum between consecutive peaks (rhythm check)
  sosCooldownMs: 8000,             // 8 seconds cooldown after activation/cancellation
  sosCountdownSeconds: 3,          // 3 seconds cancel window before dispatching alert
  gravityFilterAlpha: 0.98,        // Low-pass factor to track gravity vector (τ ≈ 1s at 50Hz)
  smoothingWindowSize: 3,          // Moving average filter size to remove sensor electronic jitter
  debugLogging: false,             // Set to true in development/calibration
};

/**
 * Helper to merge partial custom settings with the defaults.
 */
export function createShakeConfig(overrides?: Partial<ShakeConfig>): ShakeConfig {
  return {
    ...DEFAULT_SHAKE_CONFIG,
    ...overrides,
  };
}
