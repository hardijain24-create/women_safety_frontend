import { IBleService, DeviceLike } from './BleService.types';

class BleService implements IBleService {
  isAvailable(): boolean {
    return false;
  }

  requestPermissions(): Promise<boolean> {
    console.warn('[BLE] requestPermissions() called on Web: Bluetooth is unsupported on the web version.');
    return Promise.reject(new Error('Bluetooth is unsupported on the web version.'));
  }

  scanForDevices(_onDeviceFound: (device: DeviceLike) => void, onStop: () => void): void {
    console.warn('[BLE] scanForDevices() called on Web: Bluetooth is unsupported on the web version.');
    // Instantly stop scan
    setTimeout(() => {
      onStop();
    }, 0);
  }

  stopScan(): void {
    console.warn('[BLE] stopScan() called on Web: Bluetooth is unsupported on the web version.');
  }

  connectToDevice(deviceId: string): Promise<boolean> {
    console.warn(`[BLE] connectToDevice(${deviceId}) called on Web: Bluetooth is unsupported on the web version.`);
    return Promise.resolve(false);
  }

  disconnect(): Promise<void> {
    console.warn('[BLE] disconnect() called on Web: Bluetooth is unsupported on the web version.');
    return Promise.resolve();
  }

  testVibration(): Promise<void> {
    console.warn('[BLE] testVibration() called on Web: Bluetooth is unsupported on the web version.');
    return Promise.reject(new Error('Not supported on web'));
  }

  testAlarm(): Promise<void> {
    console.warn('[BLE] testAlarm() called on Web: Bluetooth is unsupported on the web version.');
    return Promise.reject(new Error('Not supported on web'));
  }

  monitorSOS(_device: DeviceLike): void {
    console.warn('[BLE] monitorSOS() called on Web: Bluetooth is unsupported on the web version.');
  }

  setOnSosTriggered(_callback: (() => void) | null): void {
    console.warn('[BLE] setOnSosTriggered() called on Web: Bluetooth is unsupported on the web version.');
  }

  isConnected(): boolean {
    return false;
  }

  subscribeConnectionState(callback: (connected: boolean) => void): () => void {
    callback(false);
    return () => {};
  }

  subscribeTelemetry(_callback: (telemetry: { battery: number | 'Unavailable'; rssi: number | 'Unavailable'; firmware: string | 'Unavailable' }) => void): () => void {
    return () => {};
  }
}

export default new BleService();

