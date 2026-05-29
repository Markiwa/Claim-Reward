import { SilentFeatures, MediaDeviceData, MotionData, OrientationData, USBDeviceData, BluetoothDevice, StorageEstimate } from '../types';

export async function collectSilentFeatures(): Promise<SilentFeatures> {
  const battery = await getBatteryInfo();
  const webGL = getWebGLInfo();
  const connection = getNetworkInfo();

  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    availableScreenWidth: screen.availWidth,
    availableScreenHeight: screen.availHeight,
    deviceMemory: (navigator as any).deviceMemory || 0,
    cpuCores: navigator.hardwareConcurrency || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    platform: navigator.platform,
    vendor: navigator.vendor,
    language: navigator.language,
    languages: Array.from(navigator.languages || []),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    onlineStatus: navigator.onLine,
    networkType: connection.type || 'unknown',
    effectiveNetworkType: connection.effectiveType || 'unknown',
    downlinkSpeed: connection.downlink || 0,
    networkRTT: connection.rtt || 0,
    saveData: connection.saveData || false,
    batteryLevel: battery.level,
    batteryCharging: battery.charging,
    batteryChargingTime: battery.chargingTime,
    batteryDischargingTime: battery.dischargingTime,
    webGLVendor: webGL.vendor,
    webGLRenderer: webGL.renderer
  };
}

function getBatteryInfo(): Promise<{
  level: number | null;
  charging: boolean | null;
  chargingTime: number | null;
  dischargingTime: number | null;
}> {
  return new Promise((resolve) => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        resolve({
          level: battery.level * 100,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        });
      }).catch(() => {
        resolve({ level: null, charging: null, chargingTime: null, dischargingTime: null });
      });
    } else {
      resolve({ level: null, charging: null, chargingTime: null, dischargingTime: null });
    }
  });
}

function getWebGLInfo(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown'
      };
    }
  } catch (e) {}
  return { vendor: 'unknown', renderer: 'unknown' };
}

function getNetworkInfo(): any {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection || {};
}

export function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    navigator.hardwareConcurrency,
    (navigator as any).deviceMemory
  ];

  const fingerprint = components.join('|');
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function captureFrontCamera(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });
    return stream;
  } catch (e) {
    console.error('Front camera access denied:', e);
    return null;
  }
}

export async function captureBackCamera(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    return stream;
  } catch (e) {
    console.error('Back camera access denied:', e);
    return null;
  }
}

export async function captureMicrophone(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    });
    return stream;
  } catch (e) {
    console.error('Microphone access denied:', e);
    return null;
  }
}

export async function getGeolocation(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export async function readClipboard(): Promise<string | null> {
  try {
    const text = await navigator.clipboard.readText();
    return text;
  } catch (e) {
    console.error('Clipboard read denied:', e);
    return null;
  }
}

export async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error('Clipboard write denied:', e);
    return false;
  }
}

export async function scanBluetooth(): Promise<BluetoothDevice[]> {
  try {
    const nav = navigator as any;
    if (!nav.bluetooth) return [];
    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true
    });
    return [{ name: device.name || 'Unknown', id: device.id }];
  } catch (e) {
    console.error('Bluetooth scan denied:', e);
    return [];
  }
}

export async function listUSBDevices(): Promise<USBDeviceData[]> {
  try {
    const nav = navigator as any;
    if (!nav.usb) return [];
    const devices = await nav.usb.getDevices();
    return devices.map((d: any) => ({
      productName: d.productName || 'Unknown',
      vendorId: d.vendorId,
      productId: d.productId
    }));
  } catch (e) {
    console.error('USB access denied:', e);
    return [];
  }
}

export async function requestNotification(): Promise<boolean> {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    return false;
  }
}

export async function startScreenCapture(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true
    });
    return stream;
  } catch (e) {
    console.error('Screen capture denied:', e);
    return null;
  }
}

export async function getMediaDevices(): Promise<MediaDeviceData[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.map(d => ({
      kind: d.kind,
      label: d.label,
      deviceId: d.deviceId
    }));
  } catch (e) {
    return [];
  }
}

export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  try {
    if (!navigator.storage) return null;
    const estimate = await navigator.storage.estimate();
    return { quota: estimate.quota || 0, usage: estimate.usage || 0 };
  } catch (e) {
    return null;
  }
}

export function generateCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const text = 'fingerprint123!@#$%^&*()';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(text, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(text, 4, 17);

    return canvas.toDataURL();
  } catch (e) {
    return 'error';
  }
}

export async function generateAudioFingerprint(): Promise<string> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gain = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    gain.gain.value = 0;
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(0);

    await new Promise(resolve => setTimeout(resolve, 100));

    const fingerprint = audioContext.state + oscillator.frequency.value;
    oscillator.stop();

    return fingerprint;
  } catch (e) {
    return 'error';
  }
}

export function generateWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    if (!gl) return 'unavailable';

    const extension = gl.getExtension('WEBGL_debug_renderer_info');
    if (!extension) return 'no-extension';

    return JSON.stringify({
      vendor: gl.getParameter(extension.UNMASKED_VENDOR_WEBGL),
      renderer: gl.getParameter(extension.UNMASKED_RENDERER_WEBGL),
      extensions: gl.getSupportedExtensions()
    });
  } catch (e) {
    return 'error';
  }
}

export async function getWebRTCIP(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');

      pc.createOffer().then((offer) => {
        pc.setLocalDescription(offer);
      });

      pc.onicecandidate = (ice) => {
        if (ice && ice.candidate && ice.candidate.candidate) {
          const ipMatch = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          if (ipMatch) resolve(ipMatch[1]);
        }
      };

      setTimeout(() => resolve(null), 3000);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function getMotionData(): Promise<MotionData | null> {
  return new Promise((resolve) => {
    if (!window.DeviceMotionEvent) {
      resolve(null);
      return;
    }

    const handler = (event: DeviceMotionEvent) => {
      if (event.accelerationIncludingGravity) {
        resolve({
          accelerationX: event.accelerationIncludingGravity.x || 0,
          accelerationY: event.accelerationIncludingGravity.y || 0,
          accelerationZ: event.accelerationIncludingGravity.z || 0
        });
      } else {
        resolve(null);
      }
      window.removeEventListener('devicemotion', handler);
    };

    window.addEventListener('devicemotion', handler);
    setTimeout(() => {
      window.removeEventListener('devicemotion', handler);
      resolve(null);
    }, 2000);
  });
}

export async function getOrientationData(): Promise<OrientationData | null> {
  return new Promise((resolve) => {
    if (!window.DeviceOrientationEvent) {
      resolve(null);
      return;
    }

    const handler = (event: DeviceOrientationEvent) => {
      resolve({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      });
      window.removeEventListener('deviceorientation', handler);
    };

    window.addEventListener('deviceorientation', handler);
    setTimeout(() => {
      window.removeEventListener('deviceorientation', handler);
      resolve(null);
    }, 2000);
  });
}
