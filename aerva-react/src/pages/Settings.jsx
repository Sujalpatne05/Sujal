import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { ModalContext } from '../App.jsx';
import { RoomIcon } from '../data/devices.jsx';
import AlertManagement from '../components/AlertManagement.jsx';
import { DEFAULT_CONFIG } from '../lib/mqttClient.js';
import { IconSettings, IconBell, IconAlert, IconDevices, IconUser, IconPlus, IconEdit, IconChevron, IconWifi } from '../components/icons.jsx';

const SECTIONS = [
  { key: 'general', label: 'General', Icon: IconSettings },
  { key: 'connection', label: 'Connection', Icon: IconWifi },
  { key: 'notifications', label: 'Notifications', Icon: IconBell },
  { key: 'devices', label: 'Devices', Icon: IconDevices },
  { key: 'alerts', label: 'Alerts', Icon: IconAlert },
  { key: 'account', label: 'Account', Icon: IconUser }
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange?.(!checked)}
      aria-pressed={checked}
    />
  );
}

function SettingRow({ title, desc, children }) {
  return (
    <div className="setting-row">
      <div className="sr-info">
        <div className="sr-title">{title}</div>
        <div className="sr-desc">{desc}</div>
      </div>
      <div className="sr-control">{children}</div>
    </div>
  );
}

function GeneralPanel() {
  const [aqi, setAqi] = React.useState('CPCB (IN)');
  const [refresh, setRefresh] = React.useState('30s');
  const [sounds, setSounds] = React.useState(true);
  return (
    <div className="card settings-content">
      <div className="ss-head">
        <h3>General preferences</h3>
        <p>How readings, units, and times display across your dashboard.</p>
      </div>
      <SettingRow title="AQI standard" desc="Calculation method for the air quality index">
        <div className="segmented">
          {['CPCB (IN)', 'US EPA', 'WHO'].map(o => (
            <button key={o} className={`seg-btn ${aqi === o ? 'active' : ''}`} onClick={() => setAqi(o)}>{o}</button>
          ))}
        </div>
      </SettingRow>
      <SettingRow title="Auto-refresh dashboard" desc="How often live readings update">
        <div className="segmented">
          {['5s', '30s', '1min'].map(o => (
            <button key={o} className={`seg-btn ${refresh === o ? 'active' : ''}`} onClick={() => setRefresh(o)}>{o}</button>
          ))}
        </div>
      </SettingRow>
      <SettingRow title="Notification sounds" desc="Audible alerts when readings cross thresholds">
        <Toggle checked={sounds} onChange={setSounds} />
      </SettingRow>
    </div>
  );
}

function NotificationsPanel() {
  const [push, setPush] = React.useState(true);
  const [email, setEmail] = React.useState(true);
  const [daily, setDaily] = React.useState(false);
  const [quiet, setQuiet] = React.useState('22:00 – 07:00');
  return (
    <div className="card settings-content">
      <div className="ss-head">
        <h3>Notification preferences</h3>
        <p>Where and how often you receive alerts about your air quality.</p>
      </div>
      <SettingRow title="Push notifications" desc="Send alerts to this device when thresholds are crossed">
        <Toggle checked={push} onChange={setPush} />
      </SettingRow>
      <SettingRow title="Email alerts" desc="Receive critical alerts at ashish@zeptac.com">
        <Toggle checked={email} onChange={setEmail} />
      </SettingRow>
      <SettingRow title="Daily summary" desc="Recap of yesterday's air quality every morning at 8 AM">
        <Toggle checked={daily} onChange={setDaily} />
      </SettingRow>
      <SettingRow title="Quiet hours" desc="Suppress non-critical alerts during sleep hours">
        <div className="segmented">
          {['Off', '22:00 – 07:00', 'Custom'].map(o => (
            <button key={o} className={`seg-btn ${quiet === o ? 'active' : ''}`} onClick={() => setQuiet(o)}>{o}</button>
          ))}
        </div>
      </SettingRow>
    </div>
  );
}

function DevicesPanel() {
  const { devices } = useApp();
  const { openAddDevice, openRenameDevice } = useContext(ModalContext);
  return (
    <div className="card settings-content">
      <div className="ss-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h3>Connected devices</h3>
          <p>Manage AERVA Home devices linked to your account.</p>
        </div>
        <button className="btn btn-accent btn-sm" onClick={openAddDevice}>
          <IconPlus /> Add device
        </button>
      </div>

      <div className="device-mgmt-list">
        {devices.map(d => (
          <div key={d.id} className="device-mgmt-row">
            <span className={`device-status-dot device-status-dot--${d.status}`} />
            <div className="device-mgmt-info">
              <div className="device-mgmt-name">
                <RoomIcon room={d.room} />
                {d.name}
              </div>
              <div className="device-mgmt-loc">AERVA Home · {d.sn} · firmware v2.4.1</div>
            </div>
            <div className="device-mgmt-aqi">
              <span className={`aqi-num aqi-num--${d.status}`}>{d.status === 'off' ? '—' : d.aqi}</span>
              <small>{d.status === 'off' ? 'offline' : 'AQI'}</small>
            </div>
            <button className="icon-btn" onClick={() => openRenameDevice(d.id)} title="Rename">
              <IconEdit />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountPanel() {
  const [tfa, setTfa] = React.useState(false);
  return (
    <div className="card settings-content">
      <div className="ss-head">
        <h3>Account</h3>
        <p>Your profile and workspace information.</p>
      </div>
      <div className="account-row">
        <div className="user-avatar account-avatar">AK</div>
        <div className="account-meta">
          <div className="account-name">Ashish Kamble</div>
          <div className="account-email">ashish@zeptac.com</div>
        </div>
        <button className="btn btn-ghost">Edit profile</button>
      </div>
      <SettingRow title="Workspace" desc="Zeptac · Admin · 5 devices">
        <button className="btn btn-ghost">Switch</button>
      </SettingRow>
      <SettingRow title="Two-factor authentication" desc="Add an extra layer of security to your account">
        <Toggle checked={tfa} onChange={setTfa} />
      </SettingRow>
      <SettingRow title="Sign out" desc="End your session on this device">
        <button className="btn btn-danger">Sign out</button>
      </SettingRow>
    </div>
  );
}

// ===== CONNECTION PANEL (MQTT broker settings) =====
function ConnectionPanel() {
  const { mqttConfig, mqttStatus, mqttError, live, lastUpdate, connectMqtt, disconnectMqtt, showToast } = useApp();
  const [form, setForm] = useState({ ...DEFAULT_CONFIG, ...mqttConfig });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const statusLabel = {
    connected: 'Connected — receiving live data',
    connecting: 'Connecting…',
    reconnecting: 'Reconnecting…',
    offline: 'Disconnected',
    error: 'Connection error',
    idle: 'Not connected (showing demo data)'
  }[mqttStatus] || mqttStatus;

  const statusTone = mqttStatus === 'connected' ? 'good'
    : (mqttStatus === 'connecting' || mqttStatus === 'reconnecting') ? 'warn'
    : 'bad';

  const handleConnect = () => {
    connectMqtt(form);
    showToast('Connecting to broker…');
  };
  const handleDisconnect = () => {
    disconnectMqtt();
    showToast('Disconnected');
  };

  return (
    <div className="card settings-card">
      <div className="settings-card-head">
        <h2>Device connection</h2>
        <p>Connect to your MQTT broker to stream live readings from your AERVA device.</p>
      </div>

      {/* Live status banner */}
      <div className={`conn-status conn-status--${statusTone}`}>
        <span className={`conn-status-dot conn-status-dot--${statusTone}`} />
        <div className="conn-status-text">
          <strong>{statusLabel}</strong>
          {mqttError && <span className="conn-status-err">{mqttError}</span>}
          {mqttStatus === 'connected' && live && (
            <span className="conn-status-meta">
              Last packet {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '—'}
              {live.mac ? ' · MAC ' + live.mac : ''}
              {live.diag?.rssi != null ? ' · RSSI ' + live.diag.rssi : ''}
            </span>
          )}
        </div>
      </div>

      <div className="conn-note">
        <strong>Important:</strong> browsers connect over WebSocket, not raw TCP. Use a <code>ws://</code> or <code>wss://</code> URL pointing at your broker's WebSocket listener (commonly port 9001, or 443 with TLS) — not port 1883. Installed PWAs on HTTPS require <code>wss://</code>.
      </div>

      <div className="field-grid">
        <div className="field field--full">
          <label>Broker WebSocket URL</label>
          <input
            className="text-input mono"
            value={form.url}
            onChange={e => set('url', e.target.value)}
            placeholder="wss://aerva.zeptac.com:443/mqtt"
            autoCapitalize="off" autoCorrect="off" spellCheck="false"
          />
        </div>

        <div className="field">
          <label>Username</label>
          <input className="text-input" value={form.username} onChange={e => set('username', e.target.value)} placeholder="aerva_zeptac" autoCapitalize="off" autoCorrect="off" spellCheck="false" />
        </div>
        <div className="field">
          <label>Password</label>
          <input className="text-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
        </div>

        <div className="field">
          <label>Device MAC / Client ID</label>
          <input className="text-input mono" value={form.mac} onChange={e => set('mac', e.target.value)} placeholder="EC64C96EDA3C" autoCapitalize="characters" autoCorrect="off" spellCheck="false" />
        </div>
        <div className="field">
          <label>Subscribe topic</label>
          <input className="text-input mono" value={form.subTopic} onChange={e => set('subTopic', e.target.value)} placeholder="AGM/pub/{MAC}" autoCapitalize="off" autoCorrect="off" spellCheck="false" />
        </div>

        <div className="field">
          <label>Publish topic</label>
          <input className="text-input mono" value={form.pubTopic} onChange={e => set('pubTopic', e.target.value)} placeholder="{MAC}/publish" autoCapitalize="off" autoCorrect="off" spellCheck="false" />
        </div>
        <div className="field">
          <label>Will topic</label>
          <input className="text-input mono" value={form.willTopic} onChange={e => set('willTopic', e.target.value)} placeholder="{MAC}/will" autoCapitalize="off" autoCorrect="off" spellCheck="false" />
        </div>
      </div>

      <div className="conn-hint mono">
        <code>{'{MAC}'}</code> is replaced with the value above. So subscribe resolves to <code>{(form.subTopic || '').replace(/\{MAC\}/g, form.mac || 'MAC')}</code>.
      </div>

      <div className="conn-actions">
        {mqttStatus === 'connected' || mqttStatus === 'connecting' || mqttStatus === 'reconnecting' ? (
          <>
            <button className="btn btn-ghost" onClick={handleDisconnect}>Disconnect</button>
            <button className="btn btn-accent" onClick={handleConnect}>Reconnect with changes</button>
          </>
        ) : (
          <button className="btn btn-accent btn-block" onClick={handleConnect}>Connect</button>
        )}
      </div>

      {/* Live payload preview */}
      {live && (
        <div className="conn-preview">
          <div className="conn-preview-head">Latest payload</div>
          <div className="conn-preview-grid">
            <Reading label="Temp" value={live.readings.temp} unit="°C" />
            <Reading label="Humidity" value={live.readings.rh} unit="%" />
            <Reading label="CO₂" value={live.readings.co2} unit="ppm" />
            <Reading label="CO" value={live.readings.co} unit="ppm" />
            <Reading label="O₂" value={live.readings.o2} unit="%" />
            <Reading label="PM2.5" value={live.readings.pm25} unit="μg/m³" />
            <Reading label="PM10" value={live.readings.pm10} unit="μg/m³" />
            <Reading label="AQI" value={live.aqi} unit="" />
          </div>
        </div>
      )}
    </div>
  );
}

function Reading({ label, value, unit }) {
  return (
    <div className="conn-reading">
      <div className="conn-reading-l mono">{label}</div>
      <div className="conn-reading-v">
        {value != null ? value : '—'}<span className="conn-reading-u">{unit}</span>
      </div>
    </div>
  );
}

export default function Settings() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { alertRules } = useApp();
  const active = SECTIONS.find(s => s.key === section)?.key || 'general';
  const enabledRules = alertRules.filter(r => r.enabled).length;

  const renderPanel = () => {
    switch (active) {
      case 'general': return <GeneralPanel />;
      case 'connection': return <ConnectionPanel />;
      case 'notifications': return <NotificationsPanel />;
      case 'alerts': return <div className="settings-panel-tinted"><AlertManagement /></div>;
      case 'devices': return <DevicesPanel />;
      case 'account': return <AccountPanel />;
      default: return <GeneralPanel />;
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="display-1">Settings</h1>
          <div className="sub mono">Account · units · notifications · devices · alerts</div>
        </div>
      </div>

      <div className="settings-grid">
        <nav className="settings-nav" aria-label="Settings sections">
          {SECTIONS.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`snav-item ${active === key ? 'active' : ''}`}
              onClick={() => navigate(`/settings/${key}`)}
            >
              <Icon />
              <span>{label}</span>
              {key === 'alerts' && enabledRules > 0 && (
                <span className="nav-badge">{enabledRules}</span>
              )}
              <IconChevron className="snav-chev" />
            </button>
          ))}
        </nav>

        <div className="settings-content-wrap">
          {renderPanel()}
        </div>
      </div>
    </>
  );
}
