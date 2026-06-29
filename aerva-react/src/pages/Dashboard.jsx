import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { useApp } from '../store.jsx';
import { ModalContext } from '../App.jsx';
import { SENSORS } from '../data/sensors.js';
import { RoomIcon, makeChartData } from '../data/devices.jsx';
import { IconPlus, IconEdit, IconSparkle, IconChevron } from '../components/icons.jsx';

function makeSpark(points, color) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const pts = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 48;
    const y = 22 - ((p - min) / range) * 18 - 2;
    return `${x},${y}`;
  }).join(' L ');
  return pts;
}

function AQIGauge({ value }) {
  const max = 300;
  const pct = Math.min(value / max, 1);
  // arc: 270° total, starts at -225deg (bottom-left), going clockwise
  const R = 84;
  const CIRC = 2 * Math.PI * R; // ~527.78
  const ARC = CIRC * (270 / 360);  // ~395.84
  const filled = ARC * pct;
  const color = value > 200 ? '#D63D3D' : value > 100 ? '#C28E00' : value > 50 ? '#C28E00' : '#1FA063';
  const label = value > 200 ? 'Severe' : value > 100 ? 'Unhealthy' : value > 50 ? 'Moderate' : 'Good';
  const statusClass = value > 100 ? 'bad' : value > 50 ? 'warn' : '';

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 200 200">
        {/* track */}
        <circle cx="100" cy="100" r={R} fill="none" stroke="#EEF2F7" strokeWidth="14"
          strokeDasharray={`${ARC} ${CIRC}`} strokeDashoffset="0" />
        {/* fill */}
        <circle cx="100" cy="100" r={R} fill="none" stroke="url(#gaugeGrad)" strokeWidth="14"
          strokeLinecap="round" strokeDasharray={`${filled} ${CIRC}`} strokeDashoffset="0" />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1FA063" />
            <stop offset="60%" stopColor="#EFBE1D" />
            <stop offset="100%" stopColor="#D63D3D" />
          </linearGradient>
        </defs>
      </svg>
      <div className="gauge-center">
        <div className="gauge-value">{value}</div>
        <div className="gauge-unit">AQI · Index</div>
        <div className={`gauge-status ${statusClass}`}>{label}</div>
      </div>
    </div>
  );
}

function HomeSensorDetail({ sensor, onClose }) {
  const { getLiveSensor, primaryRoomName } = useApp();
  const live = getLiveSensor(sensor.id);
  const value = live ? live.value : sensor.value;
  const status = live ? live.status : sensor.status;
  const statusText = live ? live.statusText : sensor.statusText;

  const statusClass = status === 'moderate' ? 'moderate' : (status === 'bad' || status === 'poor') ? 'bad' : status === 'off' ? '' : 'good';

  return (
    <div className="home-sensor-detail">
      <div className="hsd-head">
        <div>
          <div className="eyebrow">{(sensor.type || '').toUpperCase()}</div>
          <h2 className="hsd-title">{sensor.name}</h2>
          <div className="hsd-fullname mono">{sensor.fullName} · {primaryRoomName}</div>
        </div>
        <div className="hsd-head-right">
          <div className="live-pill"><span className="live-dot" />LIVE</div>
          <button className="icon-btn" onClick={onClose} title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div className="hsd-body">
        <div className="hsd-reading">
          <div className="hsd-value">
            <span className="n">{value}</span>
            <span className="u">{sensor.unit}</span>
            <span className={`hsd-status ${statusClass}`}>{statusText}</span>
          </div>

          <div className="threshold-bar-wrap" style={{ margin: '14px 0' }}>
            <div className="threshold-bar">
              <div className="threshold-marker" style={{ left: `${sensor.markerPos}%` }} />
            </div>
            <div className="threshold-labels">
              {sensor.thresholds.map((t, i) => <span key={i}>{t}</span>)}
            </div>
          </div>

          <div className="reading-stats">
            <div className="reading-stat"><div className="l">24h Avg</div><div className="v">{sensor.avg24}</div></div>
            <div className="reading-stat"><div className="l">Peak today</div><div className="v">{sensor.peak}</div></div>
            <div className="reading-stat"><div className="l">Variance</div><div className="v">±{sensor.variance}</div></div>
          </div>
        </div>

        <div className="hsd-edu">
          <div className="edu-eyebrow">What is {sensor.name}</div>
          <div className="edu-desc">{sensor.description}</div>
          <div className="edu-bullets">
            {(sensor.bullets || []).map((b, i) => (
              <span key={i} className="edu-bullet">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hsd-foot">
        <span className="mono" style={{ fontSize: '11px', color: 'var(--text-3)' }}>Updated just now · {primaryRoomName}</span>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>
          View full history &amp; chart
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}

function SensorCard({ sensor, active, onClick }) {
  const { getLiveSensor } = useApp();
  const live = getLiveSensor(sensor.id);
  const value = live ? live.value : sensor.value;
  const status = live ? live.status : sensor.status;

  const tone = status === 'moderate' ? 'yellow' : (status === 'bad' || status === 'poor') ? 'red' : status === 'off' ? 'off' : 'green';
  const displayVal = (value != null && !isNaN(value)) ? (Number.isInteger(value) ? value : Number(value).toFixed(1)) : '—';

  // Spark color matching HTML
  const sparkColor = tone === 'red' ? '#D63D3D' : tone === 'yellow' ? '#EFBE1D' : tone === 'green' ? '#1FA063' : '#2C6FB5';

  // Static spark paths matching the HTML for each sensor
  const sparkPaths = {
    co2: 'M0,15 L8,13 L16,16 L24,11 L32,12 L40,9 L48,11 L56,7 L64,8',
    co: 'M0,14 L8,13 L16,14 L24,13 L32,14 L40,13 L48,14 L56,12 L64,13',
    o2: 'M0,11 L8,12 L16,11 L24,12 L32,11 L40,12 L48,11 L56,11 L64,11',
    pm25: 'M0,16 L8,15 L16,14 L24,12 L32,10 L40,9 L48,7 L56,6 L64,5',
    temp: 'M0,13 L8,14 L16,12 L24,13 L32,11 L40,12 L48,10 L56,11 L64,9',
    rh: 'M0,9 L8,10 L16,11 L24,10 L32,12 L40,13 L48,12 L56,14 L64,15',
  };

  const trends = {
    co2: { dir: 'up', val: '4.2%' },
    co: { dir: 'flat', val: '— stable' },
    o2: { dir: 'flat', val: '— 0.0%' },
    pm25: { dir: 'up', val: '12%' },
    temp: { dir: 'up', val: '0.3°' },
    rh: { dir: 'down', val: '2.1%' },
  };
  const trend = trends[sensor.id] || { dir: 'flat', val: '—' };

  return (
    <div className={`card sensor-card${active ? ' active' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="sc-head">
        <div className="sc-name">{sensor.name}</div>
        <div className={`sc-status ${tone}`} />
      </div>
      <div className="sc-value">
        <span className="n">{displayVal}</span>
        <span className="u">{sensor.unit}</span>
      </div>
      <div className="sc-foot">
        <div className={`sc-trend ${trend.dir}`}>
          {trend.dir === 'up' ? '▲ ' : trend.dir === 'down' ? '▼ ' : ''}{trend.val}
        </div>
        <svg className="sc-spark" viewBox="0 0 64 22" preserveAspectRatio="none">
          <path d={sparkPaths[sensor.id] || sparkPaths.pm25} fill="none" stroke={sparkColor} strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { devices, primaryRoomName, mqttStatus, live, lastUpdate, getLiveSensor } = useApp();
  const { openAddDevice, openRenameDevice } = useContext(ModalContext);
  const navigate = useNavigate();
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [timeframe, setTimeframe] = useState('24H');

  const primary = devices.find(d => d.id === 'living-room') || devices[0];
  const allSensors = SENSORS.filter(s => s.id !== 'aqi');
  const chartData = makeChartData(1, 38, 14);
  const liveAqi = getLiveSensor('aqi');
  const heroAqi = liveAqi ? liveAqi.value : (primary?.aqi || 68);
  const onlineCount = devices.filter(d => d.status !== 'off').length;

  const handleSensorClick = (s) => {
    if (selectedSensor?.id === s.id) {
      setSelectedSensor(null);
    } else {
      setSelectedSensor(s);
    }
  };

  // Live sensor values for AQI breakdown
  const livePm25 = getLiveSensor('pm25');
  const liveCo2 = getLiveSensor('co2');
  const liveCo = getLiveSensor('co');
  const liveO2 = getLiveSensor('o2');
  const liveTemp = getLiveSensor('temp');
  const liveRh = getLiveSensor('rh');

  const pm25Val = livePm25 ? livePm25.value : 28;
  const co2Val = liveCo2 ? liveCo2.value : 847;
  const coVal = liveCo ? liveCo.value : 1.4;
  const o2Val = liveO2 ? liveO2.value : 20.9;
  const tempVal = liveTemp ? liveTemp.value : 28.4;
  const rhVal = liveRh ? liveRh.value : 54;

  return (
    <>
      {/* PAGE HEAD */}
      <div className="page-head">
        <div>
          <div className="eyebrow-home">
            <span className="home-dot" />
            HOME · Overview
          </div>
          <div className="greeting mono">Good morning</div>
          <h1 className="display-1">
            Good morning, <em>Ashish</em>
          </h1>
          <div className="sub mono">
            {devices.length} rooms monitored · all sensors online · Pen, Maharashtra
          </div>
        </div>
        <div className="head-stats">
          <div className="head-stat">
            <div className="v"><span className="accent">{onlineCount}</span><span style={{ fontSize: '13px', color: 'var(--text-3)' }}>/{devices.length}</span></div>
            <div className="l">Online</div>
          </div>
          <div className="div" />
          <div className="head-stat">
            <div className="v"><span className="accent">99.2%</span></div>
            <div className="l">Uptime · 30d</div>
          </div>
          <div className="div" />
          <div className="head-stat">
            <div className="v">2</div>
            <div className="l">Active alerts</div>
          </div>
        </div>
      </div>

      {/* SECTION HEAD */}
      <div className="section-head">
        <div>
          <div className="section-title">Live readings</div>
          <div className="section-sub mono">{primaryRoomName} · Updated 14 sec ago</div>
        </div>
      </div>

      {/* SENSOR GRID */}
      <div className="sensor-grid">
        {allSensors.map(s => (
          <SensorCard
            key={s.id}
            sensor={s}
            active={selectedSensor?.id === s.id}
            onClick={() => handleSensorClick(s)}
          />
        ))}
      </div>

      {/* INLINE SENSOR DETAIL */}
      {selectedSensor && (
        <HomeSensorDetail sensor={selectedSensor} onClose={() => setSelectedSensor(null)} />
      )}

      {/* DASH GRID: AQI HERO + DEVICE PANEL */}
      <div className="dash-grid">
        {/* AQI HERO */}
        <div className="card aqi-hero">
          <div className="aqi-head">
            <div className="lbl">
              <div className="eyebrow">Primary room</div>
              <div className="name">
                <span id="primaryRoomName">{primary?.name || 'Living Room'}</span>
                <button className="rename-btn" onClick={() => openRenameDevice('living-room')} title="Rename">
                  <IconEdit />
                </button>
              </div>
              <div className="meta-row" style={{ marginTop: '6px' }}>
                <span>AERVA Home · SN H487</span>
                <span className="dot" />
                <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} IST</span>
              </div>
            </div>
            <div className="live-pill" style={{ alignSelf: 'flex-start' }}>
              <span className="live-dot" />LIVE
            </div>
          </div>

          <div className="gauge-row">
            <AQIGauge value={heroAqi} />
            <div className="aqi-breakdown">
              <div className="bd-row">
                <span className="k">PM2.5</span>
                <div className="bd-bar"><div className="fill" style={{ width: `${Math.min(pm25Val / 100 * 100, 100)}%` }} /></div>
                <span className="v">{pm25Val}<span className="u">μg/m³</span></span>
              </div>
              <div className="bd-row">
                <span className="k">CO₂</span>
                <div className="bd-bar"><div className="fill" style={{ width: `${Math.min(co2Val / 2000 * 100, 100)}%` }} /></div>
                <span className="v">{co2Val}<span className="u">ppm</span></span>
              </div>
              <div className="bd-row">
                <span className="k">CO</span>
                <div className="bd-bar"><div className="fill" style={{ width: `${Math.min(coVal / 35 * 100, 100)}%` }} /></div>
                <span className="v">{coVal}<span className="u">ppm</span></span>
              </div>
              <div className="bd-row">
                <span className="k">O₂</span>
                <div className="bd-bar"><div className="fill" style={{ width: `${Math.min((o2Val / 25) * 100, 100)}%` }} /></div>
                <span className="v">{o2Val}<span className="u">%</span></span>
              </div>
              <div className="bd-row">
                <span className="k">Temp</span>
                <div className="bd-bar"><div className="fill" style={{ width: `${Math.min(((tempVal - 10) / 30) * 100, 100)}%` }} /></div>
                <span className="v">{tempVal}<span className="u">°C</span></span>
              </div>
              <div className="bd-row">
                <span className="k">Humidity</span>
                <div className="bd-bar"><div className="fill" style={{ width: `${Math.min(rhVal, 100)}%` }} /></div>
                <span className="v">{rhVal}<span className="u">%</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* DEVICE PANEL */}
        <div className="card device-panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">My rooms</div>
              <div className="mono" style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
                {devices.length} devices · home network
              </div>
            </div>
            <span className="panel-link" onClick={() => navigate('/devices/living-room')}>View all →</span>
          </div>

          <div className="device-list">
            {devices.map(d => {
              const sparkColor = d.status === 'green' ? '#1FA063' : d.status === 'warn' ? '#EFBE1D' : d.status === 'bad' ? '#D63D3D' : '#A8B5C8';
              const pts = makeSpark(d.spark, sparkColor);
              return (
                <div key={d.id} className="device-row" onClick={() => navigate(`/devices/${d.id}`)}>
                  <div className={`status-dot ${d.status === 'green' ? '' : d.status}`} />
                  <div className="device-info">
                    <div className="device-name">
                      <RoomIcon room={d.room} className="room-icon" />
                      {d.name}
                    </div>
                    <div className="device-loc">AERVA Home · {d.sn}</div>
                  </div>
                  <svg className="device-spark" viewBox="0 0 48 24" preserveAspectRatio="none">
                    <path d={`M ${pts}`} fill="none" stroke={sparkColor} strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                  <div className="device-aqi">
                    {d.status === 'off' ? <span style={{ color: 'var(--text-mute)' }}>offline</span> : d.aqi}
                    <small>{d.status === 'off' ? '—' : 'AQI'}</small>
                  </div>
                  <div className="device-actions">
                    <button className="device-action" onClick={(e) => { e.stopPropagation(); openRenameDevice(d.id); }} title="Rename">
                      <IconEdit />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="add-device-btn" onClick={openAddDevice}>
            <IconPlus style={{ width: '16px', height: '16px' }} />
            Add another device
          </button>
        </div>
      </div>

      {/* ANALYTICS ROW */}
      <div className="analytics-row">
        {/* CHART */}
        <div className="card chart-card">
          <div className="chart-head">
            <div className="chart-title-block">
              <div className="chart-title">PM2.5 trend</div>
              <div className="chart-sub">{primaryRoomName} · last 24 hours</div>
            </div>
            <div className="timeframe">
              {['1H', '24H', '7D', '30D', 'Custom'].map(tf => (
                <button key={tf} className={`tf-btn${timeframe === tf ? ' active' : ''}`} onClick={() => setTimeframe(tf)}>{tf}</button>
              ))}
            </div>
          </div>
          <div className="chart-canvas-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EFBE1D" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#EFBE1D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEF1F6" vertical={false} />
                <XAxis dataKey="time" stroke="#A8B5C8" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} interval={3} />
                <YAxis stroke="#A8B5C8" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Tooltip
                  contentStyle={{ background: '#0A2E50', border: '1px solid #EFBE1D', borderRadius: 8, fontSize: 11, color: '#fff' }}
                  labelStyle={{ color: '#A8B5C8', fontFamily: 'JetBrains Mono', fontSize: 10 }}
                />
                <Area type="monotone" dataKey="value" stroke="#EFBE1D" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI INSIGHTS */}
        <div className="card ai-card">
          <div className="ai-head">
            <div className="ai-icon">
              <IconSparkle style={{ width: '16px', height: '16px' }} />
            </div>
            <div className="chart-title">AI tips for your home</div>
          </div>
          <div className="ai-insight">
            <div className="title">PM2.5 spiking around 7 PM</div>
            <div className="body">Particulate matter rises when you cook dinner. Try running the kitchen exhaust 10 min before and after cooking.</div>
            <div className="action">Set a reminder →</div>
          </div>
          <div className="ai-insight green">
            <div className="title">Bedroom air is excellent overnight</div>
            <div className="body">CO₂ stays under 800 ppm — your sleep environment is in the optimal range. Keep windows cracked when possible.</div>
          </div>
          <div className="ai-insight red">
            <div className="title">Kitchen humidity high after meals</div>
            <div className="body">RH crosses 75% during cooking. Consider an exhaust fan upgrade or a small dehumidifier to prevent mold.</div>
            <div className="action">Learn more →</div>
          </div>
        </div>
      </div>
    </>
  );
}
