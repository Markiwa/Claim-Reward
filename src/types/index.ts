export interface DeviceData {
  deviceId: string;
  deviceFingerprint: string;
  ipAddress: string;
  firstVisit: Date;
  lastSeen: Date;
  silentFeatures: SilentFeatures;
  permissionFeatures: PermissionFeatures;
}

export interface SilentFeatures {
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelRatio: number;
  availableScreenWidth: number;
  availableScreenHeight: number;
  deviceMemory: number;
  cpuCores: number;
  maxTouchPoints: number;
  platform: string;
  vendor: string;
  language: string;
  languages: string[];
  timezone: string;
  timezoneOffset: number;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number;
  onlineStatus: boolean;
  networkType: string;
  effectiveNetworkType: string;
  downlinkSpeed: number;
  networkRTT: number;
  saveData: boolean;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  batteryChargingTime: number | null;
  batteryDischargingTime: number | null;
  webGLVendor: string;
  webGLRenderer: string;
}

export interface PermissionFeatures {
  frontCamera: string | null;
  backCamera: string | null;
  microphone: string | null;
  audioRecording: string | null;
  screenRecording: string | null;
  locationLat: number | null;
  locationLong: number | null;
  locationAccuracy: number | null;
  locationAddress: string | null;
  contacts: ContactData[] | null;
  clipboardText: string | null;
  bluetoothDevices: BluetoothDevice[] | null;
  usbDevices: USBDeviceData[] | null;
  motionData: MotionData | null;
  orientationData: OrientationData | null;
  batteryStatus: BatteryStatus | null;
  mediaDevices: MediaDeviceData[] | null;
  audioDevices: AudioDeviceData[] | null;
  storageEstimate: StorageEstimate | null;
  accelerometerData: AccelerometerData | null;
  gyroscopeData: GyroscopeData | null;
  magnetometerData: MagnetometerData | null;
  vrDisplays: VRDisplayData[] | null;
  canvasFingerprint: string | null;
  audioFingerprint: string | null;
  webGLFingerprint: string | null;
  webRTCIP: string | null;
  ambientLight: number | null;
  notification: boolean;
}

export interface ContactData {
  name: string;
  phone: string;
  email?: string;
}

export interface BluetoothDevice {
  name: string;
  id: string;
  rssi?: number;
}

export interface USBDeviceData {
  productName: string;
  vendorId: number;
  productId: number;
}

export interface MotionData {
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
}

export interface OrientationData {
  alpha: number;
  beta: number;
  gamma: number;
}

export interface BatteryStatus {
  level: number;
  charging: boolean;
  chargingTime?: number;
  dischargingTime?: number;
}

export interface MediaDeviceData {
  kind: string;
  label: string;
  deviceId: string;
}

export interface AudioDeviceData {
  deviceId: string;
  kind: string;
  label: string;
}

export interface StorageEstimate {
  quota: number;
  usage: number;
}

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
}

export interface MagnetometerData {
  x: number;
  y: number;
  z: number;
}

export interface VRDisplayData {
  displayName: string;
  isConnected: boolean;
}

export interface AdminUser {
  email: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface BlockedIP {
  ipAddress: string;
  blockedUntil: Date;
}

export interface AdminCodes {
  signupCode: string;
  forgetCode: string;
  masterCode: string;
}
