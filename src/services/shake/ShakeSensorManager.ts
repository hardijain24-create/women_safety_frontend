import { AccelerometerReading } from './types';

let Platform: any = { OS: 'android', Version: 33 };
let AppState: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RN = require('react-native');
  if (RN) {
    Platform = RN.Platform || Platform;
    AppState = RN.AppState || AppState;
  }
} catch (_) {}

type AppStateStatus = 'active' | 'background' | 'inactive';


export type SensorReadingListener = (reading: AccelerometerReading, isLinear: boolean) => void;

/**
 * Sensor Adapter Interface for pluggable hardware / library backends
 */
export interface ISensorProvider {
  isAvailableAsync(): Promise<boolean>;
  setUpdateInterval(intervalMs: number): void;
  addListener(listener: (data: { x: number; y: number; z: number }) => void): { remove: () => void };
}

/**
 * ShakeSensorManager
 *
 * Manages phone accelerometer lifecycle, frequency calibration (50 Hz),
 * unit normalization (m/s² vs g), and AppState transitions.
 */
export class ShakeSensorManager {
  private isListening = false;
  private sampleRateHz: number;
  private listeners: SensorReadingListener[] = [];
  private subscription: { remove: () => void } | null = null;
  private appStateSubscription: any = null;
  private customProvider: ISensorProvider | null = null;
  private isPausedForBackground = false;

  constructor(sampleRateHz = 50, customProvider?: ISensorProvider) {
    this.sampleRateHz = sampleRateHz;
    this.customProvider = customProvider || null;
  }

  /**
   * Set custom sensor provider (useful for testing or custom native modules)
   */
  public setProvider(provider: ISensorProvider): void {
    this.customProvider = provider;
  }

  /**
   * Subscribe to processed sensor readings
   */
  public addListener(listener: SensorReadingListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Start 50 Hz Accelerometer sampling
   */
  public async start(): Promise<boolean> {
    if (this.isListening) return true;

    const intervalMs = Math.round(1000 / this.sampleRateHz); // 20ms for 50Hz

    try {
      let sensorProvider = this.customProvider;

      if (!sensorProvider) {
        // Attempt dynamic load of expo-sensors if present
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const ExpoSensors = require('expo-sensors');
          if (ExpoSensors && ExpoSensors.Accelerometer) {
            sensorProvider = ExpoSensors.Accelerometer;
          }
        } catch (_) {
          // Expo-sensors not installed or in non-Expo environment
        }
      }

      if (sensorProvider) {
        const available = await sensorProvider.isAvailableAsync().catch(() => true);
        if (available) {
          sensorProvider.setUpdateInterval(intervalMs);
          this.subscription = sensorProvider.addListener((data: { x: number; y: number; z: number }) => {
            this.handleRawReading(data);
          });
          this.isListening = true;
        }
      }

      // Listen for AppState changes to handle background lifecycle
      if (AppState && AppState.addEventListener) {
        this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
      }

      return this.isListening;
    } catch (error) {
      console.warn('ShakeSensorManager failed to start hardware accelerometer:', error);
      return false;
    }
  }

  /**
   * Stop sampling and unregister hardware listeners
   */
  public stop(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    this.isListening = false;
  }

  /**
   * Ingest raw sensor reading, normalize to G-force (1g ≈ 9.81 m/s²), and dispatch to listeners
   */
  public handleRawReading(data: { x: number; y: number; z: number }, timestamp = Date.now()): void {
    let { x, y, z } = data;

    // Unit Normalization:
    // Android raw SensorManager delivers m/s² (1g = ~9.81 m/s²).
    // iOS CoreMotion and Expo Accelerometer deliver in g (1g = ~1.0).
    // If the magnitude is > 4.0 at rest, it is in m/s² and needs division by 9.80665.
    const rawMag = Math.sqrt(x * x + y * y + z * z);
    const isSIUnits = rawMag > 4.5; // Likely ~9.81 m/s²

    if (isSIUnits) {
      x = x / 9.80665;
      y = y / 9.80665;
      z = z / 9.80665;
    }

    const reading: AccelerometerReading = {
      x,
      y,
      z,
      timestamp,
    };

    for (const listener of this.listeners) {
      try {
        listener(reading, false);
      } catch (err) {
        console.error('Error in sensor listener:', err);
      }
    }
  }

  /**
   * Feed synthetic readings directly (used for unit tests and simulation)
   */
  public feedSyntheticReading(reading: AccelerometerReading, isLinear = false): void {
    for (const listener of this.listeners) {
      listener(reading, isLinear);
    }
  }

  /**
   * AppState handler
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.isPausedForBackground = true;
      // Note: On standard mobile platforms without foreground service / active background mode,
      // the OS suspends accelerometer updates automatically.
    } else if (nextAppState === 'active') {
      this.isPausedForBackground = false;
    }
  };

  public getIsListening(): boolean {
    return this.isListening;
  }
}
