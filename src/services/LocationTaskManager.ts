import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationApi } from '../api/services';

export const LIVE_LOCATION_TASK = 'GUARDIAN_LIVE_LOCATION';
const SHARING_START_KEY = 'live_location_start_time';
const SHARING_USER_KEY = 'live_location_user_id';
const MAX_SHARING_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Define the background task globally (safe registration)
try {
  if (TaskManager && typeof TaskManager.defineTask === 'function') {
    TaskManager.defineTask(LIVE_LOCATION_TASK, async ({ data, error }: any) => {
      if (error) {
        console.error('[LiveLocation] Background task error:', error);
        return;
      }

      // Check if the 1-hour window has expired
      try {
        const startStr = await AsyncStorage.getItem(SHARING_START_KEY);
        if (startStr) {
          const elapsed = Date.now() - parseInt(startStr, 10);
          if (elapsed >= MAX_SHARING_DURATION_MS) {
            console.log('[LiveLocation] 1-hour sharing window expired. Stopping.');
            if (Location && typeof Location.stopLocationUpdatesAsync === 'function') {
              await Location.stopLocationUpdatesAsync(LIVE_LOCATION_TASK).catch(() => {});
            }
            await AsyncStorage.removeItem(SHARING_START_KEY);
            await AsyncStorage.removeItem(SHARING_USER_KEY);
            return;
          }
        }
      } catch (e) {
        console.warn('[LiveLocation] Failed to check expiration:', e);
      }

      // Push the latest coordinates to the backend
      if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        const latest = locations?.[0];
        if (latest) {
          try {
            const userId = await AsyncStorage.getItem(SHARING_USER_KEY);
            if (userId) {
              await locationApi.updateLocation({
                user_id: userId,
                latitude: latest.coords.latitude,
                longitude: latest.coords.longitude,
              });
              console.log(`[LiveLocation] Pushed: ${latest.coords.latitude}, ${latest.coords.longitude}`);
            }
          } catch (apiErr) {
            console.warn('[LiveLocation] Failed to push location to backend:', apiErr);
          }
        }
      }
    });
  }
} catch (taskErr) {
  console.warn('[LiveLocation] TaskManager registration skipped or not supported:', taskErr);
}

export const LiveLocationManager = {
  async startSharing(userId: string): Promise<boolean> {
    try {
      if (!Location || typeof Location.requestForegroundPermissionsAsync !== 'function') {
        console.warn('[LiveLocation] Location module not available.');
        return false;
      }

      // Request background location permission
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        console.warn('[LiveLocation] Foreground location permission denied.');
        return false;
      }

      if (typeof Location.requestBackgroundPermissionsAsync === 'function') {
        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
        if (bgStatus !== 'granted') {
          console.warn('[LiveLocation] Background location permission denied.');
          return false;
        }
      }

      // Save start time and user ID so the background task can access them
      await AsyncStorage.setItem(SHARING_START_KEY, Date.now().toString());
      await AsyncStorage.setItem(SHARING_USER_KEY, userId);

      // Start background location updates
      if (typeof Location.startLocationUpdatesAsync === 'function') {
        await Location.startLocationUpdatesAsync(LIVE_LOCATION_TASK, {
          accuracy: Location.Accuracy.High,
          timeInterval: 15000, // every 15 seconds
          distanceInterval: 10, // or if moved 10 meters
          deferredUpdatesInterval: 15000,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Guardian Band',
            notificationBody: 'Sharing live location with emergency contacts',
            notificationColor: '#34c759',
          },
        });
      }

      console.log('[LiveLocation] Background location sharing started.');
      return true;
    } catch (err) {
      console.warn('[LiveLocation] startSharing error:', err);
      return false;
    }
  },

  async stopSharing(): Promise<void> {
    try {
      if (Location && typeof Location.hasStartedLocationUpdatesAsync === 'function') {
        const isTracking = await Location.hasStartedLocationUpdatesAsync(LIVE_LOCATION_TASK);
        if (isTracking && typeof Location.stopLocationUpdatesAsync === 'function') {
          await Location.stopLocationUpdatesAsync(LIVE_LOCATION_TASK);
        }
      }
    } catch (e) {
      console.warn('[LiveLocation] Error stopping location updates:', e);
    }
    await AsyncStorage.removeItem(SHARING_START_KEY);
    await AsyncStorage.removeItem(SHARING_USER_KEY);
    console.log('[LiveLocation] Background location sharing stopped.');
  },

  async isCurrentlySharing(): Promise<boolean> {
    try {
      if (!Location || typeof Location.hasStartedLocationUpdatesAsync !== 'function') return false;
      const isTracking = await Location.hasStartedLocationUpdatesAsync(LIVE_LOCATION_TASK);
      if (!isTracking) return false;

      // Also check if the 1-hour window is still valid
      const startStr = await AsyncStorage.getItem(SHARING_START_KEY);
      if (!startStr) return false;
      const elapsed = Date.now() - parseInt(startStr, 10);
      if (elapsed >= MAX_SHARING_DURATION_MS) {
        // Auto-cleanup
        await this.stopSharing();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async getRemainingMinutes(): Promise<number> {
    try {
      const startStr = await AsyncStorage.getItem(SHARING_START_KEY);
      if (!startStr) return 0;
      const elapsed = Date.now() - parseInt(startStr, 10);
      const remaining = MAX_SHARING_DURATION_MS - elapsed;
      return Math.max(0, Math.ceil(remaining / 60000));
    } catch {
      return 0;
    }
  },
};
