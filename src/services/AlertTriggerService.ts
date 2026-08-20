import { Platform, Vibration, PermissionsAndroid, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { alertApi } from '../api/services';
import { LiveLocationManager } from './LocationTaskManager';

import { SmsSender } from '../../modules/sms-sender';

type User = {
  id: string;
  name?: string;
  emergency_contacts?: { phone: string; email: string; name: string }[];
  [key: string]: any;
};

export type SOSStatus =
  | { type: 'sending' }
  | { type: 'sent' }
  | { type: 'calling'; contactName: string }
  | { type: 'no_contact' }
  | { type: 'dialer_failed' }
  | { type: 'failed'; message: string };

let isTriggering = false;

export const AlertTriggerService = {
  async triggerSOS(user: User | null, onStatusUpdate?: (status: SOSStatus) => void): Promise<void> {
    console.log("[SOS DEBUG] AlertTriggerService.triggerSOS entered");
    if (isTriggering) {
      console.log('[AlertTriggerService] SOS trigger already in progress. Ignoring duplicate request.');
      return;
    }
    isTriggering = true;

    // Start local alarm feedback instantly
    this.playSOSFeedback();

    try {
      console.log("[SOS DEBUG] user status checked, id:", user?.id);
      if (!user?.id) {
        console.warn("User not found, proceeding with local SOS actions.");
        throw new Error("Could not reach server — local alarm only");
      }

      // 📍 Get REAL location (graceful failure — SOS must not abort if GPS fails)
      let latitude = 0;
      let longitude = 0;
      try {
        console.log("[SOS DEBUG] Requesting location permissions");
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log("[SOS DEBUG] Permissions status:", status);
        if (status === 'granted') {
          console.log("[SOS DEBUG] Calling Location.getCurrentPositionAsync");
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          console.log("[SOS DEBUG] Location acquired:", location);
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
          
          LiveLocationManager.startSharing(user.id).catch(e => console.warn('[SOS DEBUG] Live location start failed:', e));
        } else {
          console.warn('[SOS] Location permission denied, sending alert without coordinates.');
        }
      } catch (locErr) {
        console.log("[SOS DEBUG] Location error caught:", locErr);
        console.warn('[SOS] GPS fetch failed, sending alert without coordinates.', locErr);
      }

      const mapsLink = (latitude !== 0 || longitude !== 0)
        ? `https://maps.google.com/?q=${latitude},${longitude}`
        : 'Location unavailable';

      let skipTwilioSms = false;
      console.log("[SOS DEBUG] Bypassed direct SMS variables check:", { mapsLink, Platform: Platform.OS, hasSmsSender: !!SmsSender, PermissionsAndroid });

      // Trigger Backend Alert (always fires, even with lat/lng of 0)
      onStatusUpdate?.({ type: 'sending' });
      console.log("[SOS DEBUG] About to call alertApi.triggerAlert");
      const response = await alertApi.triggerAlert({
        user_id: user.id,
        latitude,
        longitude,
        skip_sms: skipTwilioSms,
      });
      console.log("[SOS DEBUG] alertApi.triggerAlert response:", response);
      console.log(
        '[SOS DEBUG] FULL ALERT RESPONSE:',
        JSON.stringify(response, null, 2)
      );

      // Handle native call to nearest eligible contact
      const nearestContact =
        response?.nearest_contact ??
        response?.data?.nearest_contact ??
        response?.data?.data?.nearest_contact ??
        user.emergency_contacts?.find((c: any) => c.phone);

      console.log("[SOS DEBUG] nearest_contact:", nearestContact);

      if (nearestContact) {
        console.log("[SOS DEBUG] nearest contact name:", nearestContact?.name);
        onStatusUpdate?.({ type: 'sent' });
        const phoneNumber = nearestContact.phone?.trim();
        if (phoneNumber) {
          onStatusUpdate?.({ type: 'calling', contactName: nearestContact.name || 'Emergency contact' });
          // requestAnimationFrame yields one render frame so React Native can paint "calling" state
          await new Promise(resolve => requestAnimationFrame(resolve));
          try {
            console.log("[SOS DEBUG] Opening Android Dialer...");
            const safePhoneLog = phoneNumber.length > 4 
              ? `${phoneNumber.substring(0, 3)}...${phoneNumber.substring(phoneNumber.length - 4)}` 
              : '***';
            console.log("[SOS DEBUG] Dialer phone number:", safePhoneLog);

            if (Platform.OS === 'android') {
              try {
                const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.CALL_PHONE,
                  {
                    title: 'Phone Call Permission',
                    message: 'Guardian needs access to make phone calls to contact your emergency contacts instantly.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                  }
                );
                
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                  await IntentLauncher.startActivityAsync(
                    'android.intent.action.CALL',
                    {
                      data: `tel:${phoneNumber}`,
                    }
                  );
                  console.log("[SOS DEBUG] Android CALL intent launched successfully");
                } else {
                  await IntentLauncher.startActivityAsync(
                    'android.intent.action.DIAL',
                    {
                      data: `tel:${phoneNumber}`,
                    }
                  );
                  console.log("[SOS DEBUG] Android DIAL intent launched successfully (CALL denied)");
                }
              } catch (intentErr: any) {
                console.log("[SOS DEBUG] Android DIAL intent failed:", intentErr);
                console.log("[SOS DEBUG] Trying Linking.openURL fallback...");
                await Linking.openURL(`tel:${phoneNumber}`);
                console.log("[SOS DEBUG] Linking fallback succeeded");
              }
            } else {
              console.log("[SOS DEBUG] Opening Dialer via Linking.openURL on non-Android platform...");
              await Linking.openURL(`tel:${phoneNumber}`);
              console.log("[SOS DEBUG] Linking fallback succeeded");
            }
          } catch (callErr: any) {
            console.log("[SOS DEBUG] Linking fallback failed:", callErr);
            onStatusUpdate?.({ type: 'dialer_failed' });
          }
        } else {
          onStatusUpdate?.({ type: 'no_contact' });
        }
      } else {
        onStatusUpdate?.({ type: 'no_contact' });
      }
      
    } catch (e: any) {
      onStatusUpdate?.({ type: 'failed', message: e.message || 'Emergency alert trigger failed.' });
      throw new Error(e.response?.data?.message || e.message);
    } finally {
      setTimeout(() => {
        isTriggering = false;
      }, 5000);
    }
  },

  async playSOSFeedback() {
    try {
      const storedVib = await AsyncStorage.getItem('settings_vibration');
      const vibrationEnabled = storedVib !== 'false';
      if (!vibrationEnabled) {
        console.log('[AlertTriggerService] playSOSFeedback skipped: vibrationEnabled is false');
        return;
      }
    } catch (err) {
      console.error('Error loading settings in playSOSFeedback:', err);
    }

    // Vibration pattern (SOS in Morse: ... --- ...)
    Vibration.vibrate([200, 100, 200, 100, 200, 300, 600, 100, 600, 100, 600, 300, 200, 100, 200, 100, 200], true);
    
    // Haptic feedback
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (_) {}

    setTimeout(() => {
      Vibration.cancel();
    }, 3000);
  }
};

