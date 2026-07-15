import { BleManager, Device, BleError } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer'; // decode base64
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUARDIAN_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const GUARDIAN_SOS_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

class BleService {
  manager: BleManager;
  connectedDevice: Device | null = null;
  onSosTriggered: (() => void) | null = null;
  private isMonitoring: boolean = false;

  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
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

  scanForDevices(onDeviceFound: (device: Device) => void, onStop: () => void) {
    console.log('[BLE] Starting device scan...');
    this.manager.startDeviceScan(
      null, // Scan for all devices, filtering manually inside the callback to fix Android compatibility issues
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('[BLE] Scan Error:', error);
          onStop();
          return;
        }
        if (device) {
          console.log('[BLE] Found device:', device.name, device.id);
          // Match by name OR by our service UUID (device advertises the UUID)
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

    // Stop scan after 15 seconds
    setTimeout(() => {
      this.manager.stopDeviceScan();
      console.log('[BLE] Scan timed out.');
      onStop();
    }, 15000);
  }

  stopScan() {
    this.manager.stopDeviceScan();
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      console.log('[BLE] Connecting to device:', deviceId);
      const device = await this.manager.connectToDevice(deviceId, {
        requestMTU: 128,
      });
      this.connectedDevice = device;
      console.log('[BLE] Connected! Discovering services...');
      await AsyncStorage.setItem('pairedDeviceId', deviceId);

      await device.discoverAllServicesAndCharacteristics();
      console.log('[BLE] Services discovered. Setting up SOS monitor...');

      this.monitorSOS(device);

      device.onDisconnected((error, dev) => {
        console.log('[BLE] Device disconnected:', dev?.id, error?.message);
        this.connectedDevice = null;
        this.isMonitoring = false;
      });

      return true;
    } catch (e: any) {
      console.error('[BLE] Connection error:', e?.message || e);
      return false;
    }
  }

  async autoConnect(): Promise<boolean> {
    try {
      const deviceId = await AsyncStorage.getItem('pairedDeviceId');
      if (deviceId) {
        console.log('[BLE] Found saved device ID, attempting auto-connect to:', deviceId);
        return await this.connectToDevice(deviceId);
      }
      return false;
    } catch (e) {
      console.error('[BLE] Auto-connect error:', e);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.connectedDevice) {
        await this.manager.cancelDeviceConnection(this.connectedDevice.id);
      }
      await AsyncStorage.removeItem('pairedDeviceId');
      this.connectedDevice = null;
      this.isMonitoring = false;
      console.log('[BLE] Disconnected and unpaired.');
    } catch (e) {
      console.error('[BLE] Error disconnecting:', e);
    }
  }

  monitorSOS(device: Device) {
    if (this.isMonitoring) {
      console.log('[BLE] Already monitoring, skipping duplicate setup.');
      return;
    }
    this.isMonitoring = true;

    console.log('[BLE] SOS Monitor subscribed. Waiting for button press...');

    device.monitorCharacteristicForService(
      GUARDIAN_SERVICE_UUID,
      GUARDIAN_SOS_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('[BLE] SOS Monitor error:', error?.message);
          this.isMonitoring = false;
          return;
        }

        if (characteristic?.value) {
          // Decode the base64 value from the ESP32
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

  setOnSosTriggered(callback: () => void) {
    console.log('[BLE] SOS callback registered.');
    this.onSosTriggered = callback;
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }
}

export default new BleService();
