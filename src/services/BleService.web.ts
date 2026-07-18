import { IBleService, DeviceLike } from './BleService.types';

class BleService implements IBleService {
  requestPermissions(): Promise<boolean> {
    console.warn('[BLE] requestPermissions() called on Web: Bluetooth is unsupported on the web version.');
    return Promise.resolve(false);
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

  monitorSOS(_device: DeviceLike): void {
    console.warn('[BLE] monitorSOS() called on Web: Bluetooth is unsupported on the web version.');
  }

  setOnSosTriggered(_callback: () => void): void {
    console.warn('[BLE] setOnSosTriggered() called on Web: Bluetooth is unsupported on the web version.');
  }

  isConnected(): boolean {
    return false;
  }
}

export default new BleService();
