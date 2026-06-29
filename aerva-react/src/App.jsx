import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar, TopBar, MobileNav, Toast } from './components/Layout.jsx';
import { AddDeviceModal, RenameDeviceModal } from './components/modals/DeviceModals.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DeviceDetail from './pages/DeviceDetail.jsx';
import Settings from './pages/Settings.jsx';
import Reports from './pages/Reports.jsx';
import Onboarding from './pages/Onboarding.jsx';

// Provide modal openers via context so any page/button can trigger them
export const ModalContext = React.createContext({
  openAddDevice: () => {},
  openRenameDevice: () => {}
});

export default function App() {
  const [addOpen, setAddOpen] = useState(false);
  const [renameId, setRenameId] = useState(null);
  const { pathname } = useLocation();

  const openAddDevice = useCallback(() => setAddOpen(true), []);
  const openRenameDevice = useCallback((id) => setRenameId(id), []);

  // Hide chrome on the onboarding flow (full-bleed)
  const isOnboarding = pathname.startsWith('/onboarding');

  return (
    <ModalContext.Provider value={{ openAddDevice, openRenameDevice }}>
      {!isOnboarding && <Sidebar />}
      <main className="main">
        {!isOnboarding && <TopBar />}
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/devices/:deviceId" element={<DeviceDetail />} />
            <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
            <Route path="/settings/:section" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      {!isOnboarding && <MobileNav />}
      <Toast />
      <AddDeviceModal open={addOpen} onClose={() => setAddOpen(false)} />
      <RenameDeviceModal open={!!renameId} deviceId={renameId} onClose={() => setRenameId(null)} />
    </ModalContext.Provider>
  );
}
