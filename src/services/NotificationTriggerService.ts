import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertTriggerService } from './AlertTriggerService';

const SOS_ACTION_ID = 'trigger-sos';
const SOS_CATEGORY_ID = 'sos-category';
const PERSISTENT_NOTIFICATION_ID = 'ambient-sos-protection';

export const NotificationTriggerService = {
  async init(): Promise<void> {
    try {
      console.log('[NotificationTriggerService] Initializing...');

      // Configure category with quick-action button
      await Notifications.setNotificationCategoryAsync(SOS_CATEGORY_ID, [
        {
          identifier: SOS_ACTION_ID,
          buttonTitle: '🆘 SEND SOS',
          options: {
            opensAppToForeground: true, // Bringing to foreground allows full vibrations, audio, haptics & UI screens to render correctly
          },
        },
      ]);

      // Set up notification response received listener (for action clicks)
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        const actionIdentifier = response.actionIdentifier;
        if (actionIdentifier === SOS_ACTION_ID) {
          console.log('[NotificationTriggerService] SOS Action Button tapped!');
          
          try {
            const userStr = await AsyncStorage.getItem('userData');
            if (userStr) {
              const user = JSON.parse(userStr);
              await AlertTriggerService.triggerSOS(user);
            } else {
              console.warn('[NotificationTriggerService] No user data found to trigger SOS.');
            }
          } catch (err) {
            console.error('[NotificationTriggerService] Error during notification-triggered SOS:', err);
          }
        }
      });

      // Request notification permissions (required for Android 13+)
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        await this.showOngoingNotification();
      } else {
        console.warn('[NotificationTriggerService] Permission not granted for notifications.');
      }
    } catch (e) {
      console.error('[NotificationTriggerService] Error initializing:', e);
    }
  },

  async showOngoingNotification(): Promise<void> {
    try {
      // Define high-priority notification channel
      await Notifications.setNotificationChannelAsync('ambient-protection', {
        name: 'Ambient Protection Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F77',
      });

      // Schedule the persistent lock-screen notification
      await Notifications.scheduleNotificationAsync({
        identifier: PERSISTENT_NOTIFICATION_ID,
        content: {
          title: 'Ambient Protection Active',
          body: 'Guardian protection is running. Tap below to trigger SOS.',
          categoryIdentifier: SOS_CATEGORY_ID,
          sticky: true, // Prevents swipe-to-dismiss (ongoing notification)
          autoDismiss: false,
          color: '#F07167',
        },
        trigger: null, // trigger immediately
      });
      console.log('[NotificationTriggerService] Ongoing notification registered.');
    } catch (err) {
      console.error('[NotificationTriggerService] Failed to schedule notification:', err);
    }
  }
};
