import { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import TrackingPage from './pages/TrackingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  if (isAdmin) {
    if (isLoggedIn) {
      return <AdminDashboard onLogout={() => setIsLoggedIn(false)} />;
    }
    return <AdminLogin onSuccess={() => setIsLoggedIn(true)} />;
  }

  return <TrackingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
