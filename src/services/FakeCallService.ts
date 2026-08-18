import * as Notifications from 'expo-notifications';

// Configure how notifications appear when app is in foreground (safely)
try {
  if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false, // We'll play our own ringtone
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      } as any),
    });
  }
} catch (e) {
  console.warn('[FakeCallService] setNotificationHandler skipped:', e);
}

class FakeCallService {
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Notification permission check failed:', e);
      return false;
    }
  }

  async scheduleFakeCall(delaySeconds: number, callerName: string) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions denied.');
      return false;
    }

    try {
      // Clear any pending fake calls
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule the notification
      const trigger: Notifications.NotificationTriggerInput = delaySeconds > 0 
        ? ({ type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds } as any) 
        : null;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Incoming call...`,
          body: `📱 ${callerName} is calling`,
          data: { type: 'fake_call' },
          sound: true,
        },
        trigger,
      });

      return true;
    } catch (err) {
      console.error('Failed to schedule fake call notification:', err);
      return false;
    }
  }
}

export default new FakeCallService();
