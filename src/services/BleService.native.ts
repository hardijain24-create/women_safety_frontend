import { BleManager, Device } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer'; // decode base64
import { IBleService, DeviceLike } from './BleService.types';

const GUARDIAN_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const GUARDIAN_SOS_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

class BleService implements IBleService {
  manager: BleManager;
  connectedDevice: Device | null = null;
  onSosTriggered: (() => void) | null = null;
  private isMonitoring: boolean = false;
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private telemetryListeners: ((telemetry: { battery: number | 'Unavailable'; rssi: number | 'Unavailable'; firmware: string | 'Unavailable' }) => void)[] = [];
  private telemetryInterval: ReturnType<typeof setTimeout> | null = null;
  private isUnavailable: boolean = false;

  constructor() {
    try {
      this.manager = new BleManager();
    } catch (e) {
      console.warn('[BLE] Failed to initialize BleManager (native module missing):', e);
      this.isUnavailable = true;
      this.manager = null as any;
    }
  }

  isAvailable(): boolean {
    return !this.isUnavailable;
  }

  subscribeConnectionState(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    callback(this.isConnected());
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== callback);
    };
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (err) {
        console.warn('[BLE] Connection listener error:', err);
      }
    });
  }

  subscribeTelemetry(callback: (telemetry: { battery: number | 'Unavailable'; rssi: number | 'Unavailable'; firmware: string | 'Unavailable' }) => void): () => void {
    this.telemetryListeners.push(callback);
    if (this.isConnected()) {
      this.fetchAndBroadcastTelemetry();
    }
    return () => {
      this.telemetryListeners = this.telemetryListeners.filter(l => l !== callback);
    };
  }

  private notifyTelemetryListeners(telemetry: { battery: number | 'Unavailable'; rssi: number | 'Unavailable'; firmware: string | 'Unavailable' }) {
    this.telemetryListeners.forEach(listener => {
      try {
        listener(telemetry);
      } catch (err) {
        console.warn('[BLE] Telemetry listener error:', err);
      }
    });
  }

  async fetchAndBroadcastTelemetry() {
    if (!this.connectedDevice) return;
    try {
      const battery = await this.readBattery();
      const rssi = await this.readRSSI();
      const firmware = await this.readFirmware();
      this.notifyTelemetryListeners({ battery, rssi, firmware });
    } catch (err) {
      console.warn('[BLE] Failed to fetch/broadcast telemetry:', err);
    }
  }

  async readBattery(): Promise<number | 'Unavailable'> {
    if (!this.connectedDevice) return 'Unavailable';
    try {
      const characteristic = await this.connectedDevice.readCharacteristicForService(
        '0000180f-0000-1000-8000-00805f9b34fb', // Standard Battery Service
        '00002a19-0000-1000-8000-00805f9b34fb'  // Standard Battery Level Characteristic
      );
      if (characteristic?.value) {
        const buffer = Buffer.from(characteristic.value, 'base64');
        return buffer[0];
      }
      return 'Unavailable';
    } catch (e) {
      console.log('[BLE] Battery Level Service unavailable on this firmware.');
      return 'Unavailable';
    }
  }

  async readRSSI(): Promise<number | 'Unavailable'> {
    if (!this.connectedDevice) return 'Unavailable';
    try {
      const dev = await this.connectedDevice.readRSSI();
      return dev.rssi !== null ? Math.abs(dev.rssi) : 'Unavailable'; // UI displays signal as negative RSSI: -{signalStrength}dBm
    } catch (e) {
      console.log('[BLE] Failed to read RSSI strength.');
      return 'Unavailable';
    }
  }

  async readFirmware(): Promise<string | 'Unavailable'> {
    if (!this.connectedDevice) return 'Unavailable';
    try {
      const characteristic = await this.connectedDevice.readCharacteristicForService(
        '0000180a-0000-1000-8000-00805f9b34fb', // Standard Device Information Service
        '00002a26-0000-1000-8000-00805f9b34fb'  // Standard Firmware Revision Characteristic
      );
      if (characteristic?.value) {
        return Buffer.from(characteristic.value, 'base64').toString('utf-8');
      }
      return 'Unavailable';
    } catch (e) {
      console.log('[BLE] Firmware Revision Service unavailable on this firmware.');
      return 'Unavailable';
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (this.isUnavailable) {
      console.warn('[BLE] requestPermissions called, but BLE is unavailable.');
      return false;
    }
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  }

  scanForDevices(onDeviceFound: (device: DeviceLike) => void, onStop: () => void) {
    if (this.isUnavailable) {
      console.warn('[BLE] scanForDevices called, but BLE is unavailable.');
      onStop();
      return;
    }
    console.log('[BLE] Starting device scan...');
    this.manager.startDeviceScan(
      [GUARDIAN_SERVICE_UUID],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('[BLE] Scan Error:', error);
          onStop();
          return;
        }
        if (device) {
          console.log('[BLE] Found device:', device.name, device.id);
          if (
            device.name === 'Guardian_Device' ||
            device.name === 'GuardianDevice' ||
            device.serviceUUIDs?.includes(GUARDIAN_SERVICE_UUID)
          ) {
            console.log('[BLE] Guardian Device found! Stopping scan...');
            onDeviceFound(device);
          }
        }
      }
    );

    setTimeout(() => {
      if (!this.isUnavailable) {
        this.manager.stopDeviceScan();
      }
      console.log('[BLE] Scan timed out.');
      onStop();
    }, 15000);
  }

  stopScan() {
    if (this.isUnavailable) return;
    this.manager.stopDeviceScan();
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    if (this.isUnavailable) {
      console.warn('[BLE] connectToDevice called, but BLE is unavailable.');
      return false;
    }
    try {
      console.log('[BLE] Connecting to device:', deviceId);
      const device = await this.manager.connectToDevice(deviceId, {
        requestMTU: 128,
      });
      this.connectedDevice = device;
      console.log('[BLE] Connected! Discovering services...');

      await device.discoverAllServicesAndCharacteristics();
      console.log('[BLE] Services discovered. Setting up SOS monitor...');

      this.monitorSOS(device);

      // Start periodic telemetry broadcasts while connected (every 10s)
      this.fetchAndBroadcastTelemetry().catch(() => {});
      this.telemetryInterval = setInterval(() => {
        this.fetchAndBroadcastTelemetry().catch(() => {});
      }, 10000);

      device.onDisconnected((error, dev) => {
        console.log('[BLE] Device disconnected:', dev?.id, error?.message);
        this.clearTelemetryInterval();
        this.connectedDevice = null;
        this.isMonitoring = false;
        this.notifyConnectionListeners(false);
      });

      this.notifyConnectionListeners(true);
      return true;
    } catch (e: any) {
      console.error('[BLE] Connection error:', e?.message || e);
      this.clearTelemetryInterval();
      return false;
    }
  }

  private clearTelemetryInterval() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
  }

  monitorSOS(device: DeviceLike) {
    if (this.isMonitoring) {
      console.log('[BLE] Already monitoring, skipping duplicate setup.');
      return;
    }
    this.isMonitoring = true;

    console.log('[BLE] SOS Monitor subscribed. Waiting for button press...');
    const nativeDevice = device as Device;

    nativeDevice.monitorCharacteristicForService(
      GUARDIAN_SERVICE_UUID,
      GUARDIAN_SOS_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('[BLE] SOS Monitor error:', error?.message);
          this.isMonitoring = false;
          return;
        }

        if (characteristic?.value) {
          const decoded = Buffer.from(characteristic.value, 'base64').toString('utf-8');
          console.log('[BLE] Characteristic notification received. Value:', decoded);

          if (decoded === 'SOS') {
            console.log('[BLE] *** SOS CONFIRMED! Triggering alert... ***');
            if (this.onSosTriggered) {
              this.onSosTriggered();
            } else {
              console.warn('[BLE] SOS received but no callback is registered!');
            }
          } else {
            console.log('[BLE] Non-SOS notification ignored:', decoded);
          }
        }
      }
    );
  }

  setOnSosTriggered(callback: (() => void) | null) {
    console.log('[BLE] SOS callback updated.');
    this.onSosTriggered = callback;
  }

  async disconnect() {
    if (this.isUnavailable) return;
    this.clearTelemetryInterval();
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
      } catch (e) {
        console.error('[BLE] Error cancelling connection:', e);
      }
      this.connectedDevice = null;
      this.isMonitoring = false;
      this.notifyConnectionListeners(false);
    }
  }

  async testVibration(): Promise<void> {
    if (this.isUnavailable) {
      return Promise.reject(new Error('Bluetooth is unavailable on this device.'));
    }
    if (!this.connectedDevice) {
      throw new Error('Device not paired or connected.');
    }
    try {
      const base64Value = Buffer.from('VIBRATE').toString('base64');
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        GUARDIAN_SERVICE_UUID,
        GUARDIAN_SOS_CHAR_UUID,
        base64Value
      );
      console.log('[BLE] Vibration test command sent successfully');
    } catch (e: any) {
      console.error('[BLE] Vibration test failed:', e?.message || e);
      throw new Error(e?.message || 'Failed to write haptic feedback.');
    }
  }

  async testAlarm(): Promise<void> {
    if (this.isUnavailable) {
      return Promise.reject(new Error('Bluetooth is unavailable on this device.'));
    }
    if (!this.connectedDevice) {
      throw new Error('Device not paired or connected.');
    }
    try {
      const base64Value = Buffer.from('ALARM').toString('base64');
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        GUARDIAN_SERVICE_UUID,
        GUARDIAN_SOS_CHAR_UUID,
        base64Value
      );
      console.log('[BLE] Alarm test command sent successfully');
    } catch (e: any) {
      console.error('[BLE] Alarm test failed:', e?.message || e);
      throw new Error(e?.message || 'Failed to write alarm characteristic.');
    }
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }
}

export default new BleService();
