import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import { AppProvider } from './store.jsx';
import './index.css';

// Register the service worker (PWA)
const updateSW = registerSW({
  onNeedRefresh() {
    // Offer reload when a new SW is available
    if (confirm('A new version of AERVA is available. Reload now?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('AERVA is ready to work offline.');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
