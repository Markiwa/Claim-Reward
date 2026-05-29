import { useState } from 'react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AdminLoginProps {
  onSuccess: () => void;
}

const SIGNUP_CODE = 'DEVICE2024';
const FORGET_CODE = 'FORGET2024';

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [mode, setMode] = useState<'code' | 'signup' | 'login' | 'forget'>('code');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgetCode, setForgetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [timer, setTimer] = useState(0);

  const checkIPBlock = async () => {
    const ip = await getClientIP();
    const blockRef = doc(db, 'blocked_ips', ip);
    const blockDoc = await getDoc(blockRef);

    if (blockDoc.exists()) {
      const data = blockDoc.data();
      const blockedUntil = (data.blockedUntil as Timestamp).toDate();
      if (new Date() < blockedUntil) {
        const remaining = Math.ceil((blockedUntil.getTime() - Date.now()) / 1000 / 60);
        setBlocked(true);
        setTimer(remaining);
        return true;
      }
    }
    return false;
  };

  const blockIP = async () => {
    const ip = await getClientIP();
    const blockedUntil = new Date(Date.now() + 60 * 60 * 1000);
    await setDoc(doc(db, 'blocked_ips', ip), {
      ipAddress: ip,
      blockedUntil: Timestamp.fromDate(blockedUntil)
    });
    setBlocked(true);
    const remaining = Math.ceil((blockedUntil.getTime() - Date.now()) / 1000 / 60);
    setTimer(remaining);
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const isBlocked = await checkIPBlock();
    if (isBlocked) {
      setError(`IP blocked for ${timer} minutes`);
      setLoading(false);
      return;
    }

    if (code === SIGNUP_CODE) {
      setMode('signup');
    } else {
      await blockIP();
      setError('Wrong code! IP blocked for 1 hour.');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'admin_users', email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setError('Email already registered.');
        setLoading(false);
        return;
      }

      await setDoc(userRef, {
        email,
        password,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      });

      localStorage.setItem('admin_email', email);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'admin_users', email);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        setError('Email not found.');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      if (userData.password !== password) {
        setError('Wrong password.');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_email', email);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleForget = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (forgetCode !== FORGET_CODE) {
      setError('Wrong forget code.');
      setLoading(false);
      return;
    }

    try {
      const userRef = doc(db, 'admin_users', email);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        setError('Email not found.');
        setLoading(false);
        return;
      }

      await setDoc(userRef, {
        ...userDoc.data(),
        password: newPassword
      });

      setError('Password updated! Login now.');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="hacker-login">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes matrix {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }

        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }

        .hacker-login {
          background: #000000;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .hacker-login::before {
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

        .binary-rain {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .binary-column {
          position: absolute;
          top: -100%;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: rgba(0, 255, 0, 0.3);
          writing-mode: vertical-rl;
          animation: matrix linear infinite;
        }

        .card {
          position: relative;
          z-index: 5;
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid #00ff00;
          padding: 40px;
          box-shadow:
            0 0 30px rgba(0, 255, 0, 0.5),
            inset 0 0 30px rgba(0, 255, 0, 0.05);
          animation: glitch 5s infinite;
          min-width: 400px;
        }

        .corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid #00ff00;
        }

        .corner-tl { top: -5px; left: -5px; border-right: none; border-bottom: none; }
        .corner-tr { top: -5px; right: -5px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: -5px; left: -5px; border-right: none; border-top: none; }
        .corner-br { bottom: -5px; right: -5px; border-left: none; border-top: none; }

        h1 {
          font-family: 'Courier New', monospace;
          color: #00ff00;
          font-size: 24px;
          text-align: center;
          margin-bottom: 10px;
          text-shadow: 0 0 10px #00ff00;
          text-transform: uppercase;
          letter-spacing: 4px;
        }

        .subtitle {
          font-family: 'Courier New', monospace;
          color: #00cc00;
          font-size: 12px;
          text-align: center;
          margin-bottom: 30px;
          opacity: 0.8;
        }

        .input-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          font-family: 'Courier New', monospace;
          color: #00ff00;
          margin-bottom: 8px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        input {
          width: 100%;
          padding: 15px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid #00ff00;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          transition: all 0.3s;
        }

        input:focus {
          outline: none;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
          border-color: #00ff00;
        }

        input::placeholder {
          color: rgba(0, 255, 0, 0.4);
        }

        button {
          width: 100%;
          padding: 15px;
          background: #00ff00;
          border: none;
          color: #000000;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
        }

        button:hover {
          background: #ffffff;
          box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid #ff0000;
          padding: 15px;
          margin-bottom: 20px;
          color: #ff0000;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          text-align: center;
          animation: pulse 1s infinite;
        }

        .switch {
          text-align: center;
          margin-top: 25px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #00ff00;
        }

        .switch a {
          color: #00ff00;
          cursor: pointer;
          text-decoration: underline;
          transition: all 0.3s;
        }

        .switch a:hover {
          color: #ffffff;
          text-shadow: 0 0 10px #00ff00;
        }

        .blocked {
          text-align: center;
          padding: 20px;
        }

        .blocked h2 {
          font-family: 'Courier New', monospace;
          color: #ff0000;
          font-size: 20px;
          margin-bottom: 15px;
          text-shadow: 0 0 10px #ff0000;
          animation: pulse 1s infinite;
        }

        .blocked p {
          font-family: 'Courier New', monospace;
          color: #ff0000;
          font-size: 12px;
        }

        .status-bar {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: #00ff00;
          opacity: 0.5;
          display: flex;
          gap: 30px;
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

        .success-message {
          background: rgba(0, 255, 0, 0.2);
          border: 1px solid #00ff00;
          padding: 15px;
          margin-bottom: 20px;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          text-align: center;
        }
      `}</style>

      <div className="scanline"></div>
      <div className="cyber-grid"></div>

      <div className="binary-rain">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="binary-column"
            style={{
              left: `${i * 5}%`,
              animationDuration: `${10 + Math.random() * 20}s`,
              animationDelay: `${Math.random() * 10}s`
            }}
          >
            {Array.from({ length: 50 }).map(() =>
              Math.random() > 0.5 ? '1' : '0'
            ).join('')}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>

        {blocked ? (
          <div className="blocked">
            <h2>[ ACCESS DENIED ]</h2>
            <p>IP BLOCKED FOR {timer} MINUTES</p>
            <p style={{ marginTop: '10px', fontSize: '10px', opacity: '0.6' }}>
              SECURITY PROTOCOL ACTIVE
            </p>
          </div>
        ) : (
          <>
            {mode === 'code' && (
              <>
                <h1>[ AUTHORIZATION ]</h1>
                <p className="subtitle">// Enter secret code to proceed //</p>

                {error && <div className="error">{error}</div>}

                <form onSubmit={handleCodeSubmit}>
                  <div className="input-group">
                    <label>{'>'} Secret Code</label>
                    <input
                      type="password"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter access code..."
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading}>
                    {loading ? 'VERIFYING...' : '[ CONTINUE ]'}
                  </button>
                </form>

                <div className="switch">
                  Have account? <a onClick={() => setMode('login')}>Login</a>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <>
                <h1>[ CREATE IDENTITY ]</h1>
                <p className="subtitle">// One device = One account //</p>

                {error && <div className="error">{error}</div>}

                <form onSubmit={handleSignup}>
                  <div className="input-group">
                    <label>{'>'} Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@system.io"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>{'>'} Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create secure password..."
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading}>
                    {loading ? 'CREATING...' : '[ INITIALIZE ]'}
                  </button>
                </form>

                <div className="switch">
                  Have account? <a onClick={() => setMode('login')}>Login</a>
                </div>
              </>
            )}

            {mode === 'login' && (
              <>
                <h1>[ ACCESS PORTAL ]</h1>
                <p className="subtitle">// Enter credentials //</p>

                {error && <div className="error">{error}</div>}

                <form onSubmit={handleLogin}>
                  <div className="input-group">
                    <label>{'>'} Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@system.io"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>{'>'} Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading}>
                    {loading ? 'CONNECTING...' : '[ ACCESS ]'}
                  </button>
                </form>

                <div className="switch">
                  <a onClick={() => setMode('forget')}>Forgot Password?</a>
                </div>
              </>
            )}

            {mode === 'forget' && (
              <>
                <h1>[ RESET ACCESS ]</h1>
                <p className="subtitle">// Use forget code //</p>

                {error && (
                  error.includes('updated') ?
                  <div className="success-message">{error}</div> :
                  <div className="error">{error}</div>
                )}

                <form onSubmit={handleForget}>
                  <div className="input-group">
                    <label>{'>'} Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@system.io"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>{'>'} Forget Code</label>
                    <input
                      type="password"
                      value={forgetCode}
                      onChange={(e) => setForgetCode(e.target.value)}
                      placeholder="Enter forget code..."
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>{'>'} New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password..."
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading}>
                    {loading ? 'RESETTING...' : '[ RESET ]'}
                  </button>
                </form>

                <div className="switch">
                  <a onClick={() => setMode('login')}>Back to Login</a>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="status-bar">
        <div className="status-item">
          <div className="status-dot"></div>
          <span>SECURE</span>
        </div>
        <div className="status-item">
          <div className="status-dot"></div>
          <span>ENCRYPTED</span>
        </div>
        <div className="status-item">
          <div className="status-dot"></div>
          <span>READY</span>
        </div>
      </div>
    </div>
  );
}
