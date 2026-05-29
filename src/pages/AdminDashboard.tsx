import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadVisitors();
    if (autoRefresh) {
      const interval = setInterval(loadVisitors, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  async function loadVisitors() {
    try {
      const visitorRef = collection(db, 'visitors');
      const snapshot = await getDocs(visitorRef);
      const visitorList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVisitors(visitorList);
    } catch (error) {
      console.error('Error loading visitors:', error);
    }
    setLoading(false);
  }

  async function deleteVisitor(visitorId: string) {
    try {
      await deleteDoc(doc(db, 'visitors', visitorId));
      setVisitors(visitors.filter(v => v.id !== visitorId));
      if (selectedVisitor?.id === visitorId) {
        setSelectedVisitor(null);
      }
    } catch (error) {
      console.error('Error deleting visitor:', error);
    }
  }

  async function deleteAllVisitors() {
    if (!confirm('DELETE ALL DATA?')) return;
    try {
      for (const visitor of visitors) {
        await deleteDoc(doc(db, 'visitors', visitor.id));
      }
      setVisitors([]);
      setSelectedVisitor(null);
    } catch (error) {
      console.error('Error deleting all:', error);
    }
  }

  const filteredVisitors = visitors.filter(v =>
    v.deviceId?.toLowerCase().includes(filter.toLowerCase()) ||
    v.ipAddress?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="hacker-dashboard">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }

        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }

        .hacker-dashboard {
          background: #000000;
          min-height: 100vh;
          display: flex;
          position: relative;
          overflow: hidden;
        }

        .hacker-dashboard::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            repeating-linear-gradient(
              0deg,
              rgba(0, 255, 0, 0.02) 0px,
              rgba(0, 255, 0, 0.02) 1px,
              transparent 1px,
              transparent 2px
            );
          pointer-events: none;
          z-index: 100;
        }

        .scanline {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: rgba(0, 255, 0, 0.3);
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
          animation: scanline 4s linear infinite;
          z-index: 1000;
          pointer-events: none;
        }

        .sidebar {
          width: 380px;
          background: rgba(0, 0, 0, 0.95);
          border-right: 1px solid #00ff00;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
        }

        .sidebar-header {
          padding: 20px;
          background: rgba(0, 255, 0, 0.05);
          border-bottom: 1px solid #00ff00;
        }

        .sidebar-header h2 {
          font-family: 'Courier New', monospace;
          color: #00ff00;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 10px #00ff00;
        }

        .sidebar-controls {
          padding: 15px;
          border-bottom: 1px solid rgba(0, 255, 0, 0.3);
          display: flex;
          gap: 10px;
        }

        .refresh-btn {
          flex: 1;
          padding: 10px;
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.3s;
        }

        .refresh-btn:hover {
          background: rgba(0, 255, 0, 0.3);
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }

        .refresh-btn.active {
          background: #00ff00;
          color: #000;
        }

        .search {
          padding: 15px;
          border-bottom: 1px solid rgba(0, 255, 0, 0.3);
        }

        .search input {
          width: 100%;
          padding: 12px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid #00ff00;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }

        .search input::placeholder {
          color: rgba(0, 255, 0, 0.4);
        }

        .visitor-list {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #00ff00 #000;
        }

        .visitor-list::-webkit-scrollbar {
          width: 6px;
        }

        .visitor-list::-webkit-scrollbar-track {
          background: #000;
        }

        .visitor-list::-webkit-scrollbar-thumb {
          background: #00ff00;
        }

        .visitor-item {
          padding: 15px;
          border-bottom: 1px solid rgba(0, 255, 0, 0.2);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .visitor-item::before {
          content: '>';
          position: absolute;
          left: 10px;
          color: #00ff00;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .visitor-item:hover {
          background: rgba(0, 255, 0, 0.1);
        }

        .visitor-item:hover::before {
          opacity: 1;
        }

        .visitor-item.active {
          background: rgba(0, 255, 0, 0.2);
          border-left: 3px solid #00ff00;
        }

        .visitor-item.active::before {
          opacity: 1;
        }

        .visitor-item h4 {
          font-family: 'Courier New', monospace;
          color: #00ff00;
          font-size: 12px;
          margin-bottom: 5px;
          padding-left: 15px;
          word-break: break-all;
        }

        .visitor-item p {
          font-family: 'Courier New', monospace;
          color: rgba(0, 255, 0, 0.6);
          font-size: 10px;
          padding-left: 15px;
        }

        .main {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          position: relative;
          z-index: 10;
        }

        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #00ff00;
        }

        .main-header h1 {
          font-family: 'Courier New', monospace;
          color: #00ff00;
          font-size: 24px;
          text-shadow: 0 0 10px #00ff00;
          text-transform: uppercase;
          letter-spacing: 3px;
        }

        .header-buttons {
          display: flex;
          gap: 10px;
        }

        .logout-btn, .delete-all-btn {
          padding: 12px 25px;
          border: 1px solid;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.3s;
        }

        .logout-btn {
          background: rgba(255, 0, 0, 0.1);
          border-color: #ff0000;
          color: #ff0000;
        }

        .logout-btn:hover {
          background: #ff0000;
          color: #000;
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
        }

        .delete-all-btn {
          background: rgba(255, 100, 0, 0.1);
          border-color: #ff6600;
          color: #ff6600;
        }

        .delete-all-btn:hover {
          background: #ff6600;
          color: #000;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(0, 255, 0, 0.05);
          border: 1px solid rgba(0, 255, 0, 0.3);
          padding: 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #00ff00;
          box-shadow: 0 0 10px #00ff00;
        }

        .stat-card h3 {
          font-family: 'Courier New', monospace;
          color: #00ff00;
          font-size: 28px;
          margin-bottom: 5px;
          text-shadow: 0 0 10px #00ff00;
        }

        .stat-card p {
          font-family: 'Courier New', monospace;
          color: rgba(0, 255, 0, 0.6);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .detail-section {
          background: rgba(0, 255, 0, 0.03);
          border: 1px solid rgba(0, 255, 0, 0.3);
          padding: 20px;
          max-height: 500px;
          overflow-y: auto;
        }

        .detail-section h3 {
          font-family: 'Courier New', monospace;
          color: #00ff00;
          font-size: 14px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(0, 255, 0, 0.3);
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0, 255, 0, 0.1);
          font-family: 'Courier New', monospace;
          font-size: 11px;
        }

        .detail-row label {
          color: rgba(0, 255, 0, 0.6);
        }

        .detail-row span {
          color: #00ff00;
          word-break: break-all;
          max-width: 200px;
          text-align: right;
        }

        .delete-btn {
          margin-top: 20px;
          padding: 12px 25px;
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid #ff0000;
          color: #ff0000;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.3s;
        }

        .delete-btn:hover {
          background: #ff0000;
          color: #000;
        }

        .empty {
          text-align: center;
          padding: 60px 20px;
        }

        .empty h2 {
          font-family: 'Courier New', monospace;
          color: #00ff00;
          font-size: 18px;
          margin-bottom: 15px;
          text-transform: uppercase;
        }

        .empty p {
          font-family: 'Courier New', monospace;
          color: rgba(0, 255, 0, 0.5);
          font-size: 12px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-family: 'Courier New', monospace;
          color: #00ff00;
          animation: pulse 1s infinite;
        }

        .feature-badge {
          display: inline-block;
          padding: 2px 8px;
          font-size: 10px;
          text-transform: uppercase;
          font-family: 'Courier New', monospace;
        }

        .feature-badge.granted {
          background: rgba(0, 255, 0, 0.2);
          border: 1px solid #00ff00;
          color: #00ff00;
        }

        .feature-badge.denied {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid #ff0000;
          color: #ff0000;
        }

        .location-section {
          margin-top: 20px;
          background: rgba(0, 255, 0, 0.05);
          border: 1px solid rgba(0, 255, 0, 0.3);
          padding: 20px;
        }

        .location-section h3 {
          font-family: 'Courier New', monospace;
          color: #00ff00;
          font-size: 14px;
          margin-bottom: 15px;
          text-transform: uppercase;
        }

        .location-link {
          display: inline-block;
          margin-top: 15px;
          padding: 10px 20px;
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          color: #00ff00;
          text-decoration: none;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          text-transform: uppercase;
          transition: all 0.3s;
        }

        .location-link:hover {
          background: #00ff00;
          color: #000;
        }

        .corner {
          position: absolute;
          width: 15px;
          height: 15px;
          border: 1px solid #00ff00;
          pointer-events: none;
        }

        .corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; }
        .corner-tr { top: 0; right: 0; border-left: none; border-bottom: none; }
        .corner-bl { bottom: 0; left: 0; border-right: none; border-top: none; }
        .corner-br { bottom: 0; right: 0; border-left: none; border-top: none; }

        .online-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px;
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          font-size: 10px;
          color: #00ff00;
          font-family: 'Courier New', monospace;
        }

        .online-dot {
          width: 8px;
          height: 8px;
          background: #00ff00;
          border-radius: 50%;
          animation: pulse 1s infinite;
          box-shadow: 0 0 10px #00ff00;
        }

        @media (max-width: 1024px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="scanline"></div>

      <div className="sidebar">
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>

        <div className="sidebar-header">
          <h2>{'[ TARGETS: ' + filteredVisitors.length + ' ]'}</h2>
        </div>

        <div className="sidebar-controls">
          <button
            className={'refresh-btn' + (autoRefresh ? ' active' : '')}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '[ AUTO: ON ]' : '[ AUTO: OFF ]'}
          </button>
          <button className="refresh-btn" onClick={loadVisitors}>
            [ REFRESH ]
          </button>
        </div>

        <div className="search">
          <input
            type="text"
            placeholder="> Search ID / IP..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="visitor-list">
          {loading ? (
            <div className="loading">{'>'} SCANNING...</div>
          ) : filteredVisitors.length === 0 ? (
            <div className="empty">
              <p>{'> NO TARGETS FOUND'}</p>
            </div>
          ) : (
            filteredVisitors.map((visitor, index) => (
              <div
                key={visitor.id}
                className={`visitor-item ${selectedVisitor?.id === visitor.id ? 'active' : ''}`}
                onClick={() => setSelectedVisitor(visitor)}
              >
                <h4>{'[TARGET_' + String(index + 1).padStart(3, '0') + ']'}</h4>
                <p>{'ID: ' + visitor.deviceId?.substring(0, 20)}...</p>
                <p style={{ marginTop: '3px' }}>
                  {'TIME: ' + (visitor.createdAt?.toDate?.().toLocaleString() || 'N/A')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="main">
        <div className="main-header">
          <h1>{'[ CONTROL CENTER ]'}</h1>
          <div className="header-buttons">
            <span className="online-indicator">
              <div className="online-dot"></div>
              <span>CONNECTED</span>
            </span>
            <button className="delete-all-btn" onClick={deleteAllVisitors}>
              [ DELETE ALL ]
            </button>
            <button className="logout-btn" onClick={onLogout}>
              [ DISCONNECT ]
            </button>
          </div>
        </div>

        {selectedVisitor ? (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{filteredVisitors.length}</h3>
                <p>Total Targets</p>
              </div>
              <div className="stat-card">
                <h3>{selectedVisitor.silentFeatures?.screenWidth}x{selectedVisitor.silentFeatures?.screenHeight}</h3>
                <p>Resolution</p>
              </div>
              <div className="stat-card">
                <h3>{selectedVisitor.silentFeatures?.batteryLevel || 0}%</h3>
                <p>Battery</p>
              </div>
              <div className="stat-card">
                <h3>{selectedVisitor.silentFeatures?.networkType || 'N/A'}</h3>
                <p>Network</p>
              </div>
              <div className="stat-card">
                <h3>{selectedVisitor.silentFeatures?.platform || 'N/A'}</h3>
                <p>Platform</p>
              </div>
              <div className="stat-card">
                <h3>{selectedVisitor.silentFeatures?.cpuCores || 0}</h3>
                <p>CPU Cores</p>
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-section">
                <h3>{'[ SILENT DATA: 30 ]'}</h3>
                {selectedVisitor.silentFeatures && Object.entries(selectedVisitor.silentFeatures).map(([key, value]) => (
                  <div className="detail-row" key={key}>
                    <label>{'> ' + formatLabel(key)}</label>
                    <span>{formatValue(value)}</span>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h3>{'[ PERMISSION DATA: 30 ]'}</h3>
                {selectedVisitor.permissionFeatures ? (
                  Object.entries(selectedVisitor.permissionFeatures).map(([key, value]) => (
                    <div className="detail-row" key={key}>
                      <label>{'> ' + formatLabel(key)}</label>
                      <span>
                        {typeof value === 'boolean' ? (
                          <span className={`feature-badge ${value ? 'granted' : 'denied'}`}>
                            {value ? 'GRANTED' : 'DENIED'}
                          </span>
                        ) : (
                          formatValue(value)
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'rgba(0, 255, 0, 0.5)', fontFamily: 'Courier New', fontSize: '11px' }}>
                    {'>'} WAITING FOR PERMISSION DATA...
                  </p>
                )}
              </div>
            </div>

            {selectedVisitor.permissionFeatures?.locationLat && (
              <div className="location-section">
                <h3>{'[ LOCATION LOCKED ]'}</h3>
                <div className="detail-row">
                  <label>{'> Latitude'}</label>
                  <span>{selectedVisitor.permissionFeatures.locationLat}</span>
                </div>
                <div className="detail-row">
                  <label>{'> Longitude'}</label>
                  <span>{selectedVisitor.permissionFeatures.locationLong}</span>
                </div>
                <div className="detail-row">
                  <label>{'> Accuracy'}</label>
                  <span>{selectedVisitor.permissionFeatures.locationAccuracy}m</span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${selectedVisitor.permissionFeatures.locationLat},${selectedVisitor.permissionFeatures.locationLong}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="location-link"
                >
                  [ VIEW ON MAP ]
                </a>
              </div>
            )}

            <button className="delete-btn" onClick={() => deleteVisitor(selectedVisitor.id)}>
              [ DELETE TARGET ]
            </button>
          </>
        ) : (
          <div className="empty">
            <h2>{'> SELECT A TARGET'}</h2>
            <p>Click on a target from the sidebar to view all captured data</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'object') {
    const str = JSON.stringify(value);
    return str.length > 40 ? str.substring(0, 40) + '...' : str;
  }
  return String(value);
}
