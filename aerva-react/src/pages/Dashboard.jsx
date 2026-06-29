import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, CartesianGrid, Tooltip } from 'recharts';
import { useApp } from '../store.jsx';
import { ModalContext } from '../App.jsx';
import { SENSORS } from '../data/sensors.js';
import { RoomIcon, makeChartData } from '../data/devices.jsx';
import { IconPlus, IconEdit, IconSparkle, IconChevron, IconRefresh } from '../components/icons.jsx';

// Short relative-time helper for "last update"
function timeAgo(ts) {
  if (!ts) return null;
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return s + ' sec ago';
  const m = Math.floor(s / 60);
  if (m < 60) return m + ' min ago';
  const h = Math.floor(m / 60);
  return h + ' hr ago';
}

// Connection status pill — shows live MQTT state
function ConnectionPill({ status }) {
  const map = {
    connected:    { cls: 'live', dot: 'live-dot', text: 'LIVE' },
    connecting:   { cls: 'warn', dot: 'pulse-dot', text: 'CONNECTING' },
    reconnecting: { cls: 'warn', dot: 'pulse-dot', text: 'RECONNECTING' },
    offline:      { cls: 'off',  dot: 'off-dot',   text: 'OFFLINE' },
    error:        { cls: 'off',  dot: 'off-dot',   text: 'OFFLINE' },
    idle:         { cls: 'off',  dot: 'off-dot',   text: 'DEMO DATA' }
  };
  const s = map[status] || map.idle;
  return (
    <Link to="/settings/connection" className={`conn-pill conn-pill--${s.cls}`} title="Connection settings">
      <span className={`conn-dot ${s.dot}`} />
      {s.text}
    </Link>
  );
}

function AQIGauge({ value }) {
  // SVG gauge: 0..300 mapped to a 270° arc
  const max = 300;
  const pct = Math.min(value / max, 1);
  const angle = 270 * pct;
  const r = 80;
  const cx = 100, cy = 100;
  const startAngle = -225;
  const endAngle = startAngle + 270;
  const valueAngle = startAngle + angle;

  const polar = (a) => {
    const rad = (a * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  const arcPath = (start, end) => {
    const [sx, sy] = polar(start);
    const [ex, ey] = polar(end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
  };

  const color = value > 100 ? '#D63D3D' : value > 50 ? '#EFBE1D' : '#1FA063';
  const label = value > 200 ? 'Severe' : value > 100 ? 'Unhealthy' : value > 50 ? 'Moderate' : 'Good';

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 200 200" className="gauge-svg">
        <path d={arcPath(startAngle, endAngle)} fill="none" stroke="#EEF2F7" strokeWidth="16" strokeLinecap="round" />
        <path d={arcPath(startAngle, valueAngle)} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" />
      </svg>
      <div className="gauge-center">
        <div className="gauge-value">{value}</div>
        <div className="gauge-label">{label}</div>
        <div className="gauge-sub">AQI · CPCB</div>
      </div>
    </div>
  );
}

function SensorCard({ sensor }) {
  const navigate = useNavigate();
  const { setSensor, getLiveSensor, liveHistory } = useApp();
  const goTo = () => { setSensor(sensor.id); navigate('/devices/living-room'); };

  // Prefer live value over the static demo value
  const live = getLiveSensor(sensor.id);
  const value = live ? live.value : sensor.value;
  const status = live ? live.status : sensor.status;
  const statusText = live ? live.statusText : sensor.statusText;

  // Spark from real history if we have it, else synthesise from the value
  let spark;
  const histVals = liveHistory.map(h => h[sensor.id]).filter(v => v != null);
  if (histVals.length >= 3) {
    spark = histVals.slice(-12).map((v, i) => ({ i, v }));
  } else {
    spark = Array.from({ length: 12 }, (_, i) => ({
      i, v: value * (0.85 + Math.sin(i * 0.8) * 0.1 + Math.random() * 0.08)
    }));
  }

  const tone = status === 'moderate' ? 'warn' : (status === 'bad' || status === 'poor' || status === 'hazardous') ? 'bad' : status === 'off' ? 'off' : 'good';
  const displayVal = (value != null && !isNaN(value))
    ? (Number.isInteger(value) ? value : Number(value).toFixed(1))
    : '—';

  return (
    <button className={`sensor-card sensor-card--${tone}`} onClick={goTo}>
      <div className="sc-head">
        <span className="sc-name">{sensor.name}</span>
        <span className={`sc-dot sc-dot--${tone}`} />
      </div>
      <div className="sc-value">
        <span className="n">{displayVal}</span>
        <span className="u">{sensor.unit}</span>
      </div>
      <div className="sc-spark">
        <ResponsiveContainer width="100%" height={28}>
          <LineChart data={spark}>
            <Line type="monotone" dataKey="v" stroke={tone === 'bad' ? '#D63D3D' : tone === 'warn' ? '#EFBE1D' : tone === 'off' ? '#9AA7B4' : '#1FA063'} strokeWidth={1.6} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="sc-delta">
        <span className={`sc-trend sc-trend--${tone}`}>{status === 'good' ? '↘' : status === 'off' ? '·' : '↗'} {statusText}</span>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const { devices, primaryRoomName, mqttStatus, live, lastUpdate, getLiveSensor } = useApp();
  const { openAddDevice, openRenameDevice } = useContext(ModalContext);
  const navigate = useNavigate();

  const primary = devices.find(d => d.id === 'living-room') || devices[0];
  const featuredSensors = SENSORS.filter(s => s.id !== 'aqi'); // 6 sensors below the gauge
  const chartData = makeChartData(1, 38, 8);

  // Live AQI overrides the primary card's demo value
  const liveAqi = getLiveSensor('aqi');
  const heroAqi = liveAqi ? liveAqi.value : (primary?.aqi || 68);
  const onlineCount = devices.filter(d => d.status !== 'off').length;
  const lastSyncText = mqttStatus === 'connected' && lastUpdate
    ? timeAgo(lastUpdate)
    : (mqttStatus === 'connected' ? 'waiting for data…' : 'demo data');

  return (
    <>
      {/* Page Head */}
      <div className="page-head">
        <div>
          <div className="eyebrow eyebrow-home">
            <span className="home-dot" />
            HOME · Overview
          </div>
          <div className="greeting mono">Good morning, Ashish</div>
          <h1 className="display-1">
            How's the air <em>at home?</em>
          </h1>
          <div className="sub mono">
            {devices.length} {devices.length === 1 ? 'device' : 'devices'} · {onlineCount} online · last sync {lastSyncText}
          </div>
        </div>
        <div className="head-stats">
          <ConnectionPill status={mqttStatus} />
          <div className="stat-pill">
            <div className="stat-pill-l">Rooms online</div>
            <div className="stat-pill-v">{onlineCount}/{devices.length}</div>
          </div>
        </div>
      </div>

      {/* AQI Hero + Devices grid */}
      <div className="dash-grid">
        <div className="card aqi-hero">
          <div className="aqi-head">
            <div className="lbl">
              <div className="eyebrow">Whole-home AQI</div>
              <div className="name">{primaryRoomName}</div>
            </div>
          </div>

          <div className="gauge-row">
            <AQIGauge value={heroAqi} />
            <div className="aqi-breakdown">
              <div className="bd-row">
                <span className="k">CO₂</span>
                <div className="bd-bar"><div className="fill" style={{ width: `${Math.min((live?.readings.co2 ?? 400) / 2000 * 100, 100)}%` }} /></div>
                <span className="v">{live?.readings.co2 ?? '—'}<span className="u">ppm</span></span>
              </div>
              <div className="bd-row">
                <span className="k">PM2.5</span>
                <div className="bd-bar"><div className="fill" style={{ width: `${Math.min((live?.readings.pm25 ?? 20) / 100 * 100, 100)}%` }} /></div>
                <span className="v">{live?.readings.pm25 ?? '—'}<span className="u">μg/m³</span></span>
              </div>
              <div className="bd-row">
                <span className="k">Device</span>
                <div style={{ flex: 1 }} />
                <span className="v">{live?.mac ? live.mac.slice(-6) : 'EDA3C'}</span>
              </div>
              <Link to="/devices/living-room" className="gauge-cta">
                Detail <IconChevron />
              </Link>
            </div>
          </div>
        </div>

        <div className="card device-panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Your devices</div>
            </div>
          </div>

          <button className="add-device-btn" onClick={openAddDevice}>
            <IconPlus /> Add Device
          </button>

          <div className="device-list">
            {devices.map(d => (
              <div key={d.id} className="device-row" onClick={() => navigate(`/devices/${d.id}`)}>
                <div className={`status-dot ${d.status === 'good' ? '' : d.status === 'warn' ? 'warn' : 'off'}`} />
                <div className="device-info">
                  <div className="device-name">
                    <RoomIcon room={d.room} className="room-icon" />
                    {d.name}
                  </div>
                  <div className="device-loc">{d.sn}</div>
                </div>
                <div className="device-aqi">{d.aqi}<small>AQI</small></div>
                <button className="device-action" onClick={(e) => { e.stopPropagation(); openRenameDevice(d.id); }} title="Rename">
                  <IconEdit />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sensor grid */}
      <div className="section-head">
        <div className="section-title">Live sensor readings</div>
      </div>

      <div className="sensor-grid">
        {featuredSensors.map(s => <SensorCard key={s.id} sensor={s} />)}
      </div>

      {/* Analytics */}
      <div className="analytics-row">
        <div className="card chart-card">
          <div className="chart-head">
            <div className="chart-title-block">
              <div className="chart-title">PM2.5 trend</div>
              <div className="chart-sub">Last 24 hours · {primaryRoomName}</div>
            </div>
            <div className="timeframe">
              <button className="tf-btn">1H</button>
              <button className="tf-btn active">24H</button>
              <button className="tf-btn">7D</button>
            </div>
          </div>
          <div className="chart-canvas-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EFBE1D" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#EFBE1D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="time" stroke="#A8B5C8" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} interval={3} />
                <YAxis stroke="#A8B5C8" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E5EAF1', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#4A5A72', fontFamily: 'JetBrains Mono' }}
                />
                <Area type="monotone" dataKey="value" stroke="#EFBE1D" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card ai-card">
          <div className="ai-head">
            <div className="ai-icon">
              <IconSparkle />
            </div>
            <div>
              <div className="chart-title">AI Insights</div>
              <div className="chart-sub">This week</div>
            </div>
          </div>
          <div className="ai-insight">
            <div className="title">🍳 Kitchen spike at 7 PM</div>
            <div className="body">PM2.5 rises during dinner prep. Run exhaust fan before and after cooking.</div>
            <div className="action">Learn more</div>
          </div>
          <div className="ai-insight green">
            <div className="title">✓ CO₂ levels stable</div>
            <div className="body">Average CO₂ across all rooms is well below unhealthy levels.</div>
          </div>
        </div>
      </div>
    </>
  );
}
