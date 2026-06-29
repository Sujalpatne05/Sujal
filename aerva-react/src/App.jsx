import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, TopBar, MobileNav, Toast } from './components/Layout.jsx';
import { AddDeviceModal, RenameDeviceModal } from './components/modals/DeviceModals.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DeviceDetail from './pages/DeviceDetail.jsx';
import Settings from './pages/Settings.jsx';
import Reports from './pages/Reports.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Alerts from './pages/Alerts.jsx';
import Login from './pages/Login.jsx';

export const ModalContext = React.createContext({
  openAddDevice: () => {},
  openRenameDevice: () => {}
});

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('auth-token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [addOpen, setAddOpen] = useState(false);
  const [renameId, setRenameId] = useState(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const openAddDevice = useCallback(() => setAddOpen(true), []);
  const openRenameDevice = useCallback((id) => setRenameId(id), []);

  const isOnboarding = pathname.startsWith('/onboarding');
  const isLogin = pathname === '/login';

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token && !isLogin && !isOnboarding) {
      navigate('/login');
    }
  }, []);

  return (
    <ModalContext.Provider value={{ openAddDevice, openRenameDevice }}>
      {!isOnboarding && !isLogin && <Sidebar />}
      <main className="main">
        {!isOnboarding && !isLogin && <TopBar />}
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/devices/:deviceId" element={<ProtectedRoute><DeviceDetail /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
            <Route path="/settings/:section" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      {!isOnboarding && !isLogin && <MobileNav />}
      {!isLogin && <InstallPrompt />}
      <Toast />
      <AddDeviceModal open={addOpen} onClose={() => setAddOpen(false)} />
      <RenameDeviceModal open={!!renameId} deviceId={renameId} onClose={() => setRenameId(null)} />
    </ModalContext.Provider>
  );
}
