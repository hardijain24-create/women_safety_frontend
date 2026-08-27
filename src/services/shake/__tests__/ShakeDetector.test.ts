import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { ShakeDetector } from '../ShakeDetector';
import { SOSController } from '../SOSController';
import { AccelerometerReading } from '../types';

/**
 * Utility to generate synthetic 50Hz accelerometer data (dt = 20ms)
 */
function feedSamples(
  detector: ShakeDetector,
  durationMs: number,
  generator: (t: number) => { x: number; y: number; z: number }
): { triggered: boolean; triggerCount: number } {
  const dt = 20; // 50 Hz -> 20ms per sample
  let triggered = false;
  let triggerCount = 0;

  detector.onShakeDetected(() => {
    triggered = true;
    triggerCount++;
  });

  for (let t = 0; t <= durationMs; t += dt) {
    const { x, y, z } = generator(t);
    const reading: AccelerometerReading = { x, y, z, timestamp: t };
    const res = detector.processSample(reading, false);
    if (res) {
      triggered = true;
    }
  }

  return { triggered, triggerCount };
}

describe('ShakeDetector Signal Processing & False Positive Rejection Tests', () => {

  it('Test 1: No movement (Phone at rest on flat table with 1g gravity along Z)', () => {
    const detector = new ShakeDetector({ shakeThresholdG: 2.7 });
    
    const result = feedSamples(detector, 2000, () => ({
      x: 0.01 * (Math.random() - 0.5),
      y: 0.01 * (Math.random() - 0.5),
      z: 1.0 + 0.01 * (Math.random() - 0.5), // ~1.0g earth gravity
    }));

    assert.strictEqual(result.triggered, false, 'Phone at rest must not trigger shake');
    assert.strictEqual(detector.getRecentPeaks().length, 0, 'Should have 0 peaks at rest');
  });

  it('Test 2: Normal walking (Periodic 1.8 Hz vertical oscillation, ~0.3g linear magnitude)', () => {
    const detector = new ShakeDetector({ shakeThresholdG: 2.7 });

    const result = feedSamples(detector, 3000, t => {
      const walkFreq = (2 * Math.PI * 1.8 * t) / 1000;
      return {
        x: 0.1 * Math.sin(walkFreq * 0.5),
        y: 0.15 * Math.sin(walkFreq),
        z: 1.0 + 0.35 * Math.sin(walkFreq), // 0.35g linear variation
      };
    });

    assert.strictEqual(result.triggered, false, 'Walking motion must not trigger SOS');
    assert.strictEqual(detector.getRecentPeaks().length, 0, 'No walking peaks should cross 2.7g');
  });

  it('Test 3: Running (Periodic 2.8 Hz vertical impact, ~1.5g linear magnitude)', () => {
    const detector = new ShakeDetector({ shakeThresholdG: 2.7 });

    const result = feedSamples(detector, 3000, t => {
      const runFreq = (2 * Math.PI * 2.8 * t) / 1000;
      return {
        x: 0.4 * Math.sin(runFreq),
        y: 0.5 * Math.cos(runFreq),
        z: 1.0 + 1.4 * Math.sin(runFreq), // 1.4g dynamic peaks
      };
    });

    assert.strictEqual(result.triggered, false, 'Running gait must not trigger SOS');
    assert.strictEqual(detector.getRecentPeaks().length, 0, 'Running peaks are below 2.7g threshold');
  });

  it('Test 4: Single impact (e.g. hitting phone on table or accidental knock)', () => {
    const detector = new ShakeDetector({ shakeThresholdG: 2.7, requiredShakes: 3 });

    let triggered = false;
    detector.onShakeDetected(() => {
      triggered = true;
    });

    // 0ms to 700ms: Stillness, with a sharp 3.8g impact lasting 60ms (3 samples) at t=300ms
    for (let t = 0; t <= 700; t += 20) {
      let x = 0;
      let y = 0;
      let z = 1.0;

      if (t >= 300 && t <= 360) {
        z = 4.8; // 4.8 - 1.0 = 3.8g linear spike
      }

      detector.processSample({ x, y, z, timestamp: t });
    }

    assert.strictEqual(triggered, false, 'Single table impact must NOT trigger SOS');
    assert.strictEqual(detector.getRecentPeaks().length, 1, 'Only 1 peak recorded from single impact');
  });

  it('Test 5: Two shakes (Only 2 peaks, less than the required 3)', () => {
    const detector = new ShakeDetector({
      shakeThresholdG: 2.7,
      requiredShakes: 3,
      minPeakIntervalMs: 180,
      shakeWindowMs: 1000,
    });

    let triggered = false;
    detector.onShakeDetected(() => {
      triggered = true;
    });

    for (let t = 0; t <= 700; t += 20) {
      let x = 0;
      let y = 0;
      let z = 1.0;

      // Peak 1 at 200-260ms
      if (t >= 200 && t <= 260) x = 3.8;
      // Peak 2 at 450-510ms
      if (t >= 450 && t <= 510) x = -3.8;

      detector.processSample({ x, y, z, timestamp: t });
    }

    assert.strictEqual(triggered, false, 'Two shakes should not trigger SOS (requires 3)');
    assert.strictEqual(detector.getRecentPeaks().length, 2, 'Should have recorded exactly 2 peaks');
  });

  it('Test 6: Three valid shakes (3 distinct peaks within 1000ms, spaced >= 180ms)', () => {
    const detector = new ShakeDetector({
      shakeThresholdG: 2.7,
      requiredShakes: 3,
      shakeWindowMs: 1000,
      minPeakIntervalMs: 180,
    });

    let detectedDetails: any = null;
    detector.onShakeDetected(details => {
      detectedDetails = details;
    });

    for (let t = 0; t <= 1000; t += 20) {
      let x = 0;
      let y = 0;
      let z = 1.0;

      // Shake 1 at 200-260ms (+X)
      if (t >= 200 && t <= 260) x = 3.8;
      // Shake 2 at 450-510ms (-X)
      if (t >= 450 && t <= 510) x = -3.8;
      // Shake 3 at 700-760ms (+X)
      if (t >= 700 && t <= 760) x = 3.8;

      detector.processSample({ x, y, z, timestamp: t });
    }

    assert.notStrictEqual(detectedDetails, null, 'Three valid deliberate shakes MUST trigger SOS');
    assert.strictEqual(detectedDetails.peakCount, 3);
    assert.ok(detectedDetails.confidence > 0.6, 'Confidence score should be strong');
  });

  it('Test 7: Three shakes outside time window (spread over > 1000ms window)', () => {
    const detector = new ShakeDetector({
      shakeThresholdG: 2.7,
      requiredShakes: 3,
      shakeWindowMs: 1000, // 1000ms window
      minPeakIntervalMs: 180,
    });

    let triggered = false;
    detector.onShakeDetected(() => {
      triggered = true;
    });

    for (let t = 0; t <= 3000; t += 20) {
      let x = 0;
      let y = 0;
      let z = 1.0;

      // Peak 1 at 200-260ms
      if (t >= 200 && t <= 260) x = 3.8;
      // Peak 2 at 900-960ms (700ms gap)
      if (t >= 900 && t <= 960) x = -3.8;
      // Peak 3 at 1700-1760ms (800ms gap - t=200 has expired by now!)
      if (t >= 1700 && t <= 1760) x = 3.8;

      detector.processSample({ x, y, z, timestamp: t });
    }

    assert.strictEqual(triggered, false, 'Three slow shakes spread beyond 1s window must not trigger SOS');
  });

  it('Test 8: Multiple rapid peaks from one single movement (Refractory period test)', () => {
    const detector = new ShakeDetector({
      shakeThresholdG: 2.7,
      requiredShakes: 3,
      minPeakIntervalMs: 180,
      shakeWindowMs: 1000,
    });

    let triggered = false;
    detector.onShakeDetected(() => {
      triggered = true;
    });

    // Single physical impact that rings with 3 rapid sub-spikes within 80ms (< 180ms refractory)
    for (let t = 0; t <= 500; t += 20) {
      let x = 0;
      let y = 0;
      let z = 1.0;

      // Spike 1 at 200-240ms
      if (t >= 200 && t <= 240) x = 4.0;
      // Spike 2 at 260-280ms (< 180ms after 200ms)
      if (t >= 260 && t <= 280) x = 4.2;

      detector.processSample({ x, y, z, timestamp: t });
    }

    assert.strictEqual(triggered, false, 'Sub-oscillations within 180ms refractory period must be counted as 1 peak');
    assert.strictEqual(detector.getRecentPeaks().length, 1, 'Only 1 peak should be registered');
  });

  it('Test 9: Phone drop (Free-fall at 0g for 400ms followed by single 5g floor deceleration spike)', () => {
    const detector = new ShakeDetector({ shakeThresholdG: 2.7, requiredShakes: 3 });

    let triggered = false;
    detector.onShakeDetected(() => {
      triggered = true;
    });

    for (let t = 0; t <= 2000; t += 20) {
      let x = 0;
      let y = 0;
      let z = 1.0;

      if (t >= 400 && t <= 780) {
        // Free-fall: total acceleration drops to near 0g
        x = 0;
        y = 0;
        z = 0;
      } else if (t >= 800 && t <= 860) {
        // Impact with floor: high deceleration spike
        z = 5.5;
      }

      detector.processSample({ x, y, z, timestamp: t });
    }

    assert.strictEqual(triggered, false, 'Dropping phone on floor must not trigger SOS');
  });

  it('Test 10: Vehicle vibration (25 Hz road/engine vibration, 0.4g ripple + noise)', () => {
    const detector = new ShakeDetector({ shakeThresholdG: 2.7 });

    const result = feedSamples(detector, 3000, t => {
      const vibFreq = (2 * Math.PI * 25 * t) / 1000; // 25 Hz
      return {
        x: 0.3 * Math.sin(vibFreq) + 0.1 * (Math.random() - 0.5),
        y: 0.3 * Math.cos(vibFreq) + 0.1 * (Math.random() - 0.5),
        z: 1.0 + 0.4 * Math.sin(vibFreq * 1.5),
      };
    });

    assert.strictEqual(result.triggered, false, 'Vehicle vibration must not trigger SOS');
    assert.strictEqual(detector.getRecentPeaks().length, 0, 'Vibration peaks stay below threshold');
  });
});

describe('SOSController State Machine & Lifecycle Tests', () => {

  it('Test 11 & 12: Successful Countdown and User Cancellation', () => {
    const controller = new SOSController({
      shakeThresholdG: 2.5,
      requiredShakes: 3,
      sosCountdownSeconds: 3,
      sosCooldownMs: 2000,
    });

    const states: string[] = [];
    controller.onStateChange(state => {
      states.push(state);
    });

    assert.strictEqual(controller.getState(), 'IDLE');

    // Simulate 3 valid shakes directly through detector
    const detector = controller.getDetector();
    for (let t = 0; t <= 1000; t += 20) {
      let x = 0;
      let y = 0;
      let z = 1.0;
      if (t >= 100 && t <= 160) x = 3.8;
      if (t >= 350 && t <= 410) x = -3.8;
      if (t >= 600 && t <= 660) x = 3.8;
      detector.processSample({ x, y, z, timestamp: t });
    }

    // Must have transitioned to COUNTDOWN
    assert.strictEqual(controller.getState(), 'COUNTDOWN');
    assert.ok(states.includes('COUNTDOWN'), 'Must have emitted COUNTDOWN state');

    // User presses Cancel
    controller.cancelSOS();
    assert.strictEqual(controller.getState(), 'COOLDOWN');
    assert.ok(states.includes('CANCELLED'), 'Must have emitted CANCELLED state');

    controller.stop();
  });

  it('Test 13: Cooldown period rejects subsequent shakes until re-armed', () => {
    const controller = new SOSController({
      shakeThresholdG: 2.5,
      requiredShakes: 3,
      sosCountdownSeconds: 3,
      sosCooldownMs: 5000,
    });

    // Trigger into COUNTDOWN and Cancel -> Enters COOLDOWN
    const detector = controller.getDetector();
    for (let t = 0; t <= 1000; t += 20) {
      let x = 0;
      if (t >= 100 && t <= 160) x = 3.8;
      if (t >= 350 && t <= 410) x = -3.8;
      if (t >= 600 && t <= 660) x = 3.8;
      detector.processSample({ x, y: 0, z: 1.0, timestamp: t });
    }

    assert.strictEqual(controller.getState(), 'COUNTDOWN');
    controller.cancelSOS();
    assert.strictEqual(controller.getState(), 'COOLDOWN');

    // During COOLDOWN, feed another 3 shakes
    for (let t = 1500; t <= 2500; t += 20) {
      let x = 0;
      if (t >= 1600 && t <= 1660) x = 3.8;
      if (t >= 1850 && t <= 1910) x = -3.8;
      if (t >= 2100 && t <= 2160) x = 3.8;
      detector.processSample({ x, y: 0, z: 1.0, timestamp: t });
    }

    // Should STILL be in COOLDOWN, not re-triggered
    assert.strictEqual(controller.getState(), 'COOLDOWN');
    controller.stop();
  });
});
