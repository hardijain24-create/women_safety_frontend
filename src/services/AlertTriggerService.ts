import { Platform, Vibration, PermissionsAndroid, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { alertApi } from '../api/services';

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

      // Try Direct SMS on Android
      if (Platform.OS === 'android') {
        try {
          console.log("[SOS DEBUG] Requesting Android SMS permissions...");
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.SEND_SMS,
            {
              title: 'SMS Permission Required',
              message: 'We need permission to send emergency SMS directly from your phone.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          console.log("[SOS DEBUG] Android SMS permissions result:", granted);

          const message = `🚨 EMERGENCY ALERT 🚨\n\n${user.name || 'Someone'} may be in danger!\n\n📍 Location:\n${mapsLink}\n\nPlease act immediately.`;
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            if (user.emergency_contacts && user.emergency_contacts.length > 0) {
              let directSentCount = 0;
              for (const contact of user.emergency_contacts) {
                if (contact.phone) {
                  try {
                    if (SmsSender) {
                      await SmsSender.sendDirectSMS(contact.phone, message);
                      directSentCount++;
                    } else {
                      throw new Error('SmsSender native module not available');
                    }
                  } catch (smsError) {
                    console.log(`Direct SMS failed for ${contact.phone}:`, smsError);
                    // Intent fallback — do NOT count as sent (requires manual tap)
                    try {
                      if (SmsSender) {
                        await SmsSender.openSMSIntent(contact.phone, message);
                      }
                    } catch (intentError) {
                      console.log(`Intent SMS also failed for ${contact.phone}`, intentError);
                    }
                  }
                }
              }
              if (directSentCount > 0) {
                skipTwilioSms = true;
              }
            }
          } else {
            // Permission denied — try a single Intent SMS (no permission needed)
            console.log("SMS permission denied. Trying Intent-based SMS...");
            if (user.emergency_contacts && user.emergency_contacts.length > 0) {
              const firstContact = user.emergency_contacts.find(c => c.phone);
              if (firstContact?.phone) {
                try {
                  if (SmsSender) {
                    await SmsSender.openSMSIntent(firstContact.phone, message);
                  }
                  // Don't skip Twilio — Intent SMS needs manual user tap
                } catch (e) {
                  console.log("Intent SMS also failed", e);
                }
              }
            }
          }
        } catch (e) {
          console.log("Direct SMS failed or permission denied, falling back to Twilio", e);
        }
      }

      // Trigger Backend Alert (always fires, even with lat/lng of 0)
      onStatusUpdate?.({ type: 'sending' });
      console.log("[SOS DEBUG] Calling alertApi.triggerAlert");
      const response = await alertApi.triggerAlert({
        user_id: user.id,
        latitude,
        longitude,
        skip_sms: skipTwilioSms,
      });
      console.log("[SOS DEBUG] alertApi.triggerAlert RESOLVED", response);

      // Handle native call to nearest eligible contact
      const nearestContact = response?.nearest_contact || response?.data?.nearest_contact;
      console.log("[SOS DEBUG] nearest_contact", nearestContact);

      if (nearestContact) {
        onStatusUpdate?.({ type: 'sent' });
        const phoneNumber = nearestContact.phone?.trim();
        if (phoneNumber) {
          onStatusUpdate?.({ type: 'calling', contactName: nearestContact.name || 'nearest contact' });
          // requestAnimationFrame yields one render frame so React Native can paint "calling" state
          await new Promise(resolve => requestAnimationFrame(resolve));
          try {
            console.log("[SOS DEBUG] ABOUT TO OPEN DIALER", phoneNumber);
            await Linking.openURL(`tel:${phoneNumber}`);
            console.log("[SOS DEBUG] DIALER INTENT OPENED");
          } catch (callErr: any) {
            console.error("[SOS DEBUG] DIALER FAILED", callErr);
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

