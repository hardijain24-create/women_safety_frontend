import { SOSEventPayload } from './types';

let Platform: any = { OS: 'android', Version: 33 };
let Location: any = null;
let Battery: any = null;
let AlertTriggerService: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RN = require('react-native');
  if (RN && RN.Platform) Platform = RN.Platform;
} catch (_) {}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Location = require('expo-location');
} catch (_) {}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Battery = require('expo-battery');
} catch (_) {}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AlertTriggerService = require('../AlertTriggerService').AlertTriggerService;
} catch (_) {}


/**
 * UUID v4 Generator (safe across platforms without native crypto dependencies)
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * SOSService
 *
 * Handles constructing standardized SOS event payloads, fetching GPS coordinates & device info,
 * and dispatching the payload to backend APIs, emergency contacts, and local alert services.
 */
export class SOSService {
  /**
   * Build a complete SOS Event Payload
   */
  public static async buildSOSEvent(
    userId: string,
    metadata: {
      peakCount: number;
      maxPeakG: number;
      shakeDurationMs: number;
      confidenceScore: number;
      configuredThresholdG: number;
    }
  ): Promise<SOSEventPayload> {
    // 1. Fetch real-time GPS coordinates
    let coordinates = {
      latitude: 0,
      longitude: 0,
      accuracy: null as number | null,
      altitude: null as number | null,
      speed: null as number | null,
    };

    try {
      const { status } = await Location.requestForegroundPermissionsAsync().catch(() => ({ status: 'denied' }));
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }).catch(() => null);

        if (loc && loc.coords) {
          coordinates = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            altitude: loc.coords.altitude,
            speed: loc.coords.speed,
          };
        }
      }
    } catch (e) {
      console.warn('Could not acquire real-time GPS location for SOS:', e);
    }

    // 2. Query Device Telemetry
    let batteryLevel: number | undefined;
    let isCharging: boolean | undefined;
    try {
      if (Battery && Battery.getBatteryLevelAsync) {
        batteryLevel = await Battery.getBatteryLevelAsync();
        const batteryState = await Battery.getBatteryStateAsync();
        isCharging = batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL;
      }
    } catch (_) {}

    const payload: SOSEventPayload = {
      userId,
      sosEventId: generateUUID(),
      timestamp: new Date().toISOString(),
      coordinates,
      deviceInfo: {
        platform: Platform.OS as 'android' | 'ios' | 'web',
        osVersion: String(Platform.Version),
        batteryLevel: batteryLevel ? Math.round(batteryLevel * 100) : undefined,
        isCharging,
      },
      triggerType: 'SHAKE',
      sosStatus: 'TRIGGERED',
      metadata,
    };

    return payload;
  }

  /**
   * Dispatch the SOS alert payload to the backend and emergency contacts
   */
  public static async dispatchSOS(
    user: any,
    metadata: {
      peakCount: number;
      maxPeakG: number;
      shakeDurationMs: number;
      confidenceScore: number;
      configuredThresholdG: number;
    }
  ): Promise<SOSEventPayload> {
    const payload = await this.buildSOSEvent(user?.id || 'anonymous_user', metadata);

    try {
      // Trigger backend alert & direct SMS through AlertTriggerService
      await AlertTriggerService.triggerSOS(user);
    } catch (error) {
      console.error('Error in AlertTriggerService during Shake-SOS dispatch:', error);
      // Fallback local haptic alert so user is aware regardless of network
      AlertTriggerService.playSOSFeedback();
      throw error;
    }

    return payload;
  }
}
