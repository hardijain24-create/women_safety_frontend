import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SettingsContextType {
  vibrationEnabled: boolean;
  alarmEnabled: boolean;
  autoConnect: boolean; // Map to autoSync in wearable views
  fakeCallerName: string;
  fakeCallDelay: number; // in seconds
  voiceEnabled: boolean;
  setVibrationEnabled: (value: boolean) => Promise<void>;
  setAlarmEnabled: (value: boolean) => Promise<void>;
  setAutoConnect: (value: boolean) => Promise<void>;
  setFakeCallerName: (value: string) => Promise<void>;
  setFakeCallDelay: (value: number) => Promise<void>;
  setVoiceEnabled: (value: boolean) => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vibrationEnabled, setVibrationState] = useState(true);
  const [alarmEnabled, setAlarmState] = useState(true);
  const [autoConnect, setAutoConnectState] = useState(true);
  const [fakeCallerName, setFakeCallerNameState] = useState('Mom');
  const [fakeCallDelay, setFakeCallDelayState] = useState(5);
  const [voiceEnabled, setVoiceState] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedVib = await AsyncStorage.getItem('settings_vibration');
        const storedAlarm = await AsyncStorage.getItem('settings_alarm');
        const storedSync = await AsyncStorage.getItem('settings_sync');
        const storedFakeName = await AsyncStorage.getItem('settings_fake_caller_name');
        const storedFakeDelay = await AsyncStorage.getItem('settings_fake_call_delay');
        const storedVoice = await AsyncStorage.getItem('settings_voice_sos');

        if (storedVib !== null) setVibrationState(storedVib === 'true');
        if (storedAlarm !== null) setAlarmState(storedAlarm === 'true');
        if (storedSync !== null) setAutoConnectState(storedSync === 'true');
        if (storedFakeName !== null) setFakeCallerNameState(storedFakeName);
        if (storedFakeDelay !== null) setFakeCallDelayState(parseInt(storedFakeDelay, 10));
        if (storedVoice !== null) setVoiceState(storedVoice === 'true');
      } catch (err) {
        console.error('Failed to load settings preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const setVibrationEnabled = async (val: boolean) => {
    setVibrationState(val);
    try {
      await AsyncStorage.setItem('settings_vibration', String(val));
    } catch (err) {
      console.error(err);
    }
  };

  const setAlarmEnabled = async (val: boolean) => {
    setAlarmState(val);
    try {
      await AsyncStorage.setItem('settings_alarm', String(val));
    } catch (err) {
      console.error(err);
    }
  };

  const setAutoConnect = async (val: boolean) => {
    setAutoConnectState(val);
    try {
      await AsyncStorage.setItem('settings_sync', String(val));
    } catch (err) {
      console.error(err);
    }
  };

  const setFakeCallerName = async (val: string) => {
    setFakeCallerNameState(val);
    try {
      await AsyncStorage.setItem('settings_fake_caller_name', val);
    } catch (err) {
      console.error(err);
    }
  };

  const setFakeCallDelay = async (val: number) => {
    setFakeCallDelayState(val);
    try {
      await AsyncStorage.setItem('settings_fake_call_delay', String(val));
    } catch (err) {
      console.error(err);
    }
  };

  const setVoiceEnabled = async (val: boolean) => {
    setVoiceState(val);
    try {
      await AsyncStorage.setItem('settings_voice_sos', String(val));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        vibrationEnabled,
        alarmEnabled,
        autoConnect,
        fakeCallerName,
        fakeCallDelay,
        voiceEnabled,
        setVibrationEnabled,
        setAlarmEnabled,
        setAutoConnect,
        setFakeCallerName,
        setFakeCallDelay,
        setVoiceEnabled,
      }}
    >
      {!loading && children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
