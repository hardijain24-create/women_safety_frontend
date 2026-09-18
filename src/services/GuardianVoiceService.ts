/**
 * GuardianVoiceService.ts
 * 
 * TypeScript wrapper around the native GuardianVoiceModule.
 * Provides a clean API for starting/stopping voice wake word detection
 * and listening for "Guardian Guardian" trigger events.
 * 
 * Usage:
 *   import { GuardianVoiceService } from '@/services/GuardianVoiceService';
 *   
 *   // Start listening
 *   await GuardianVoiceService.startListening();
 *   
 *   // Listen for wake word detection
 *   const unsubscribe = GuardianVoiceService.onWakeWordDetected(() => {
 *     AlertTriggerService.triggerSOS(user);
 *   });
 *   
 *   // Stop listening
 *   await GuardianVoiceService.stopListening();
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { GuardianVoiceModule } = NativeModules;

// Create the event emitter only on Android (where the native module exists)
const voiceEventEmitter = Platform.OS === 'android' && GuardianVoiceModule
  ? new NativeEventEmitter(GuardianVoiceModule)
  : null;

export const GuardianVoiceService = {
  /**
   * Start the always-on voice wake word detection foreground service.
   * This will show a persistent notification and begin listening for "Guardian Guardian".
   * 
   * IMPORTANT: RECORD_AUDIO permission must be granted BEFORE calling this.
   * On Android 14+, this MUST be called while the app is in the foreground.
   */
  async startListening(): Promise<void> {
    if (Platform.OS !== 'android' || !GuardianVoiceModule) {
      console.warn('[GuardianVoiceService] Voice SOS is only supported on Android.');
      return;
    }
    try {
      await GuardianVoiceModule.startListening();
      console.log('[GuardianVoiceService] Voice wake word detection started.');
    } catch (error) {
      console.error('[GuardianVoiceService] Failed to start listening:', error);
      throw error;
    }
  },

  /**
   * Stop the voice wake word detection foreground service.
   */
  async stopListening(): Promise<void> {
    if (Platform.OS !== 'android' || !GuardianVoiceModule) return;
    try {
      await GuardianVoiceModule.stopListening();
      console.log('[GuardianVoiceService] Voice wake word detection stopped.');
    } catch (error) {
      console.error('[GuardianVoiceService] Failed to stop listening:', error);
      throw error;
    }
  },

  /**
   * Check if the voice detection service is currently running.
   */
  async isListening(): Promise<boolean> {
    if (Platform.OS !== 'android' || !GuardianVoiceModule) return false;
    try {
      return await GuardianVoiceModule.isListening();
    } catch {
      return false;
    }
  },

  /**
   * Register a callback for when the wake word "Guardian Guardian" is detected.
   * Returns an unsubscribe function.
   * 
   * @param callback - Function to call when wake word is detected
   * @returns Unsubscribe function to remove the listener
   */
  onWakeWordDetected(callback: () => void): () => void {
    if (!voiceEventEmitter) {
      console.warn('[GuardianVoiceService] Voice events not available on this platform.');
      return () => {};
    }

    const subscription = voiceEventEmitter.addListener('onGuardianTriggered', () => {
      console.log('[GuardianVoiceService] 🚨 Wake word "Guardian Guardian" detected!');
      callback();
    });

    return () => {
      subscription.remove();
    };
  },
};
