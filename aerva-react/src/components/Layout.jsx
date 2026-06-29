import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../store.jsx';
import {
  IconHome, IconDevices, IconAlert, IconPlus, IconFile, IconSettings,
  IconSearch, IconMenu, IconChevron, IconBell
} from './icons.jsx';

export function Logo() {
  return (
    <svg className="brand-logo" viewBox="0 0 40 40" width="40" height="40" aria-label="AERVA logo">
      <circle cx="20" cy="20" r="18" fill="#0A2E50"/>
      <path d="M 10 22 Q 14 17, 20 19 T 30 21" stroke="#EFBE1D" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M 9 18 Q 15 13, 20 15 T 31 17" stroke="#EFBE1D" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M 11 26 Q 15 22, 20 24 T 29 25" stroke="#EFBE1D" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.5"/>
      <circle cx="20" cy="20" r="2" fill="#EFBE1D"/>
    </svg>
  );
}

export function Sidebar() {
  const { devices, alertRules, drawerOpen, toggleDrawer } = useApp();
  const enabledRules = alertRules.filter(r => r.enabled).length;

  const handleClick = () => {
    if (window.matchMedia('(max-width: 768px)').matches) {
      toggleDrawer(false);
    }
  };

  return (
    <>
      <div className={`drawer-overlay ${drawerOpen ? 'show' : ''}`} onClick={() => toggleDrawer(false)} />
      <aside className={`sidebar ${drawerOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Logo />
          <div className="brand-text">
            <div className="brand-name">AERVA</div>
            <div className="brand-sub">Breathe better</div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-label">Monitor</div>
          <NavLink to="/" end className="nav-item" onClick={handleClick}>
            <IconHome /> Home
          </NavLink>
          <NavLink to="/devices/living-room" className="nav-item" onClick={handleClick}>
            <IconDevices /> My devices
            <span className="nav-badge success">{devices.length}</span>
          </NavLink>
          <NavLink to="/alerts" className="nav-item" onClick={handleClick}>
            <IconAlert /> Alerts
            <span className="nav-badge">{enabledRules}</span>
          </NavLink>

          <div className="nav-label" style={{ marginTop: 22 }}>Workspace</div>
          <NavLink to="/onboarding" className="nav-item" onClick={handleClick}>
            <IconPlus /> Add device
          </NavLink>
          <NavLink to="/reports" className="nav-item" onClick={handleClick}>
            <IconFile /> Reports
          </NavLink>
          <NavLink to="/settings" className="nav-item" onClick={handleClick}>
            <IconSettings /> Settings
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">AK</div>
            <div className="user-meta">
              <div className="user-name">Ashish Kamble</div>
              <div className="user-org">Zeptac · Admin</div>
            </div>
            <IconChevron style={{ opacity: 0.5, width: 14, height: 14 }} />
          </div>
        </div>
      </aside>
    </>
  );
}

const VIEW_LABELS = {
  '/': 'Home',
  '/alerts': 'Alerts',
  '/devices': 'Rooms',
  '/reports': 'Reports',
  '/onboarding': 'Add device',
  '/settings': 'Settings',
  '/settings/general': 'Settings · General',
  '/settings/connection': 'Settings · Connection',
  '/settings/notifications': 'Settings · Notifications',
  '/settings/devices': 'Settings · Devices',
  '/settings/alerts': 'Settings · Alerts',
  '/settings/account': 'Settings · Account'
};

export function TopBar() {
  const { toggleDrawer } = useApp();
  const { pathname } = useLocation();

  let label = 'AERVA';
  for (const key of Object.keys(VIEW_LABELS).sort((a, b) => b.length - a.length)) {
    if (pathname === key || pathname.startsWith(key + '/')) {
      label = VIEW_LABELS[key];
      break;
    }
  }
  if (pathname.startsWith('/devices/')) label = 'Rooms';

  return (
    <div className="topbar">
      <button className="menu-btn" onClick={() => toggleDrawer(true)} aria-label="Open menu">
        <IconMenu />
      </button>
      <div className="breadcrumb">
        <span>AERVA</span>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">{label}</span>
      </div>
      <div className="topbar-search">
        <IconSearch />
        <input placeholder="Search rooms, alerts…" />
      </div>
      <div className="topbar-actions">
        <div className="live-pill">
          <span className="live-dot"></span>
          <span>Live</span>
        </div>
        <button className="icon-btn" aria-label="Notifications">
          <IconBell />
          <span className="ping" />
        </button>
      </div>
    </div>
  );
}

export function MobileNav() {
  const { pathname } = useLocation();
  const isActive = (path, exact = false) => exact ? pathname === path : pathname.startsWith(path);

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <div className="mobile-nav-inner">
        <NavLink to="/" end className={`mnav-item ${isActive('/', true) ? 'active' : ''}`}>
          <IconHome /><span>Home</span>
        </NavLink>
        <NavLink to="/devices/living-room" className={`mnav-item ${isActive('/devices') ? 'active' : ''}`}>
          <IconDevices /><span>Rooms</span>
        </NavLink>
        <NavLink to="/onboarding" className="mnav-item" style={{ position: 'relative' }}>
          <div className="mnav-fab"><IconPlus /></div>
          <span style={{ marginTop: -6 }}>Add</span>
        </NavLink>
        <NavLink to="/alerts" className={`mnav-item ${isActive('/alerts') ? 'active' : ''}`}>
          <IconAlert /><span>Alerts</span>
        </NavLink>
        <NavLink to="/settings" className={`mnav-item ${isActive('/settings') ? 'active' : ''}`}>
          <IconSettings /><span>More</span>
        </NavLink>
      </div>
    </nav>
  );
}

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="toast">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EFBE1D" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
      <span>{toast}</span>
    </div>
  );
}
