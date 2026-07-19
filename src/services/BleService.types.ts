export interface DeviceLike {
  id: string;
  name?: string | null;
  [key: string]: any;
}

export interface IBleService {
  isAvailable(): boolean;
  requestPermissions(): Promise<boolean>;
  scanForDevices(
    onDeviceFound: (device: DeviceLike) => void,
    onStop: () => void
  ): void;
  stopScan(): void;
  connectToDevice(deviceId: string): Promise<boolean>;
  disconnect(): Promise<void>;
  monitorSOS(device: DeviceLike): void;
  setOnSosTriggered(callback: () => void): void;
  isConnected(): boolean;
  testVibration(): Promise<void>;
  testAlarm(): Promise<void>;
  subscribeConnectionState(callback: (connected: boolean) => void): () => void;
  subscribeTelemetry(callback: (telemetry: { battery: number | 'Unavailable'; rssi: number | 'Unavailable'; firmware: string | 'Unavailable' }) => void): () => void;
}



