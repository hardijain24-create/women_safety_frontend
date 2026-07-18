export interface DeviceLike {
  id: string;
  name?: string | null;
  [key: string]: any;
}

export interface IBleService {
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
}
