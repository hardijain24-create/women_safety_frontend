import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import BleService from '../services/BleService';
import type { DeviceLike } from '../services/BleService.types';

export interface BleContextType {
  isConnected: boolean;
  isScanning: boolean;
  isAvailable: boolean;
  connectedDevice: DeviceLike | null;
  batteryLevel: number | 'Unavailable' | null;
  signalStrength: number | 'Unavailable' | null;
  firmwareVersion: string | 'Unavailable' | null;
  scannedDevices: DeviceLike[];

  scanForDevices(): Promise<void>;
  connect(id: string): Promise<boolean>;
  disconnect(): Promise<void>;
  testVibration(): Promise<void>;
  testAlarm(): Promise<void>;
}

export const BleContext = createContext<BleContextType | undefined>(undefined);

export const BleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAvailable] = useState(() => BleService.isAvailable());
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<DeviceLike | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | 'Unavailable' | null>(null);
  const [signalStrength, setSignalStrength] = useState<number | 'Unavailable' | null>(null);
  const [firmwareVersion, setFirmwareVersion] = useState<string | 'Unavailable' | null>(null);
  const [scannedDevices, setScannedDevices] = useState<DeviceLike[]>([]);

  // Listen to BLE connection changes and telemetry broadcasts
  useEffect(() => {
    const unsubscribeConnection = BleService.subscribeConnectionState((connected) => {
      setIsConnected(connected);
      if (!connected) {
        setConnectedDevice(null);
        setBatteryLevel(null);
        setSignalStrength(null);
        setFirmwareVersion(null);
      }
    });

    const unsubscribeTelemetry = BleService.subscribeTelemetry((telemetry) => {
      setBatteryLevel(telemetry.battery);
      setSignalStrength(telemetry.rssi);
      setFirmwareVersion(telemetry.firmware);
    });

    return () => {
      unsubscribeConnection();
      unsubscribeTelemetry();
    };
  }, []);

  const scanForDevices = async () => {
    if (!isAvailable) {
      throw new Error('Bluetooth is unavailable on this device.');
    }
    const hasPermissions = await BleService.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Bluetooth and location permissions are required.');
    }

    setIsScanning(true);
    setScannedDevices([]);
    BleService.scanForDevices(
      (device) => {
        setScannedDevices((prev) => {
          if (prev.some((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      },
      () => {
        setIsScanning(false);
      }
    );
  };

  const connect = async (id: string): Promise<boolean> => {
    setIsScanning(false);
    BleService.stopScan();

    if (id === 'esp32-safety-band-v2') {
      const dev = { id, name: 'Guardian Band (Mock)' };
      setConnectedDevice(dev);
      setIsConnected(true);
      setBatteryLevel(95);
      setSignalStrength(-60);
      setFirmwareVersion('v2.1.0 (Mock)');
      return true;
    }

    const success = await BleService.connectToDevice(id);
    if (success) {
      const dev = scannedDevices.find((d) => d.id === id) || { id, name: 'Guardian Band Wearable' };
      setConnectedDevice(dev);
      setIsConnected(true);
    }
    return success;
  };

  const disconnect = async () => {
    await BleService.disconnect();
    setConnectedDevice(null);
    setIsConnected(false);
    setBatteryLevel(null);
    setSignalStrength(null);
    setFirmwareVersion(null);
  };

  const testVibration = async () => {
    console.log('[BleContext] Test vibration triggered');
    await BleService.testVibration();
  };

  const testAlarm = async () => {
    console.log('[BleContext] Test alarm triggered');
    await BleService.testAlarm();
  };

  return (
    <BleContext.Provider
      value={{
        isConnected,
        isScanning,
        isAvailable,
        connectedDevice,
        batteryLevel,
        signalStrength,
        firmwareVersion,
        scannedDevices,
        scanForDevices,
        connect,
        disconnect,
        testVibration,
        testAlarm,
      }}
    >
      {children}
    </BleContext.Provider>
  );
};

export const useBle = () => {
  const context = useContext(BleContext);
  if (!context) {
    throw new Error('useBle must be used within a BleProvider');
  }
  return context;
};
