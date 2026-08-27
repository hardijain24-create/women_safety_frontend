import {
  SOSState,
  SOSStateChangeCallback,
  ShakeConfig,
  SOSEventPayload,
} from './types';
import { ShakeDetector } from './ShakeDetector';
import { ShakeSensorManager } from './ShakeSensorManager';
import { SOSService } from './SOSService';
import { DEFAULT_SHAKE_CONFIG, createShakeConfig } from './config';

/**
 * SOSController
 *
 * Coordinates the full Shake-to-SOS lifecycle:
 * ShakeSensorManager (Hardware) -> ShakeDetector (Algorithm) -> SOSController (State Machine) -> SOSConfirmationUI & SOSService (Backend/SMS)
 */
export class SOSController {
  private config: ShakeConfig;
  private detector: ShakeDetector;
  private sensorManager: ShakeSensorManager;
  private state: SOSState = 'IDLE';

  // Timer references
  private countdownTimer: any = null;
  private cooldownTimer: any = null;
  private remainingCountdown = 0;

  // Active user reference
  private currentUser: any = null;

  // Cached shake metadata for payload
  private lastShakeMetadata: {
    peakCount: number;
    maxPeakG: number;
    shakeDurationMs: number;
    confidenceScore: number;
    configuredThresholdG: number;
  } | null = null;

  // Listeners
  private stateListeners: SOSStateChangeCallback[] = [];

  constructor(config?: Partial<ShakeConfig>, sensorManager?: ShakeSensorManager, detector?: ShakeDetector) {
    this.config = createShakeConfig(config);
    this.detector = detector || new ShakeDetector(this.config);
    this.sensorManager = sensorManager || new ShakeSensorManager(this.config.sensorSampleRateHz);

    this.setupBindings();
  }

  private setupBindings(): void {
    // Pipe sensor readings into detector
    this.sensorManager.addListener((reading, isLinear) => {
      if (this.state === 'IDLE') {
        this.detector.processSample(reading, isLinear);
      }
    });

    // Handle shake detected
    this.detector.onShakeDetected(details => {
      this.handleShakeDetected(details);
    });
  }

  public setUser(user: any): void {
    this.currentUser = user;
  }

  public onStateChange(listener: SOSStateChangeCallback): () => void {
    this.stateListeners.push(listener);
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== listener);
    };
  }

  private setState(newState: SOSState, remaining = 0): void {
    this.state = newState;
    this.remainingCountdown = remaining;
    for (const listener of this.stateListeners) {
      try {
        listener(newState, remaining);
      } catch (e) {
        console.error('Error in SOSController state listener:', e);
      }
    }
  }

  public getState(): SOSState {
    return this.state;
  }

  public getRemainingCountdown(): number {
    return this.remainingCountdown;
  }

  /**
   * Start sensor monitoring
   */
  public async start(): Promise<boolean> {
    this.detector.reset();
    return await this.sensorManager.start();
  }

  /**
   * Stop sensor monitoring
   */
  public stop(): void {
    this.clearTimers();
    this.sensorManager.stop();
    this.detector.reset();
    this.setState('IDLE');
  }

  /**
   * Invoked when ShakeDetector identifies 3 valid peaks
   */
  private handleShakeDetected(details: {
    peakCount: number;
    maxPeakG: number;
    shakeDurationMs: number;
    confidence: number;
  }): void {
    // Only accept triggers if currently IDLE
    if (this.state !== 'IDLE') {
      return;
    }

    this.lastShakeMetadata = {
      ...details,
      confidenceScore: details.confidence,
      configuredThresholdG: this.config.shakeThresholdG,
    };

    this.setState('SHAKE_DETECTED');
    this.startCountdown();
  }

  /**
   * Starts the 3-second SOS countdown window
   */
  public startCountdown(): void {
    this.clearTimers();
    let secondsLeft = this.config.sosCountdownSeconds;
    this.setState('COUNTDOWN', secondsLeft);

    this.countdownTimer = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft > 0) {
        this.setState('COUNTDOWN', secondsLeft);
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.triggerSOS();
      }
    }, 1000);
  }

  /**
   * User explicitly taps [ CANCEL ] during the countdown window
   */
  public cancelSOS(): void {
    if (this.state === 'COUNTDOWN' || this.state === 'SHAKE_DETECTED') {
      this.clearTimers();
      this.setState('CANCELLED');
      this.enterCooldown();
    }
  }

  /**
   * Countdown completed without cancellation: Activate SOS
   */
  private async triggerSOS(): Promise<SOSEventPayload | null> {
    this.setState('TRIGGERED', 0);

    const metadata = this.lastShakeMetadata || {
      peakCount: this.config.requiredShakes,
      maxPeakG: this.config.shakeThresholdG,
      shakeDurationMs: 800,
      confidenceScore: 0.9,
      configuredThresholdG: this.config.shakeThresholdG,
    };

    try {
      const payload = await SOSService.dispatchSOS(this.currentUser, metadata);
      this.enterCooldown();
      return payload;
    } catch (e) {
      console.error('Failed to execute SOS activation:', e);
      this.enterCooldown();
      return null;
    }
  }

  /**
   * Manual trigger bypass (for testing or UI button press)
   */
  public async forceTrigger(): Promise<SOSEventPayload | null> {
    return await this.triggerSOS();
  }

  /**
   * Enter refractory cooldown period to prevent repeated activations
   */
  private enterCooldown(): void {
    this.clearTimers();
    this.setState('COOLDOWN');
    this.detector.reset();

    this.cooldownTimer = setTimeout(() => {
      this.setState('IDLE');
      this.cooldownTimer = null;
    }, this.config.sosCooldownMs);
  }

  private clearTimers(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.cooldownTimer) {
      clearTimeout(this.cooldownTimer);
      this.cooldownTimer = null;
    }
  }

  public getDetector(): ShakeDetector {
    return this.detector;
  }

  public getSensorManager(): ShakeSensorManager {
    return this.sensorManager;
  }
}
