import React, { useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { useApp } from '../store.jsx';
import { ModalContext } from '../App.jsx';
import { SENSORS, findSensor } from '../data/sensors.js';
import { SensorIllustration, makeChartData, makeReadings } from '../data/devices.jsx';
import { IconEdit, IconDownload } from '../components/icons.jsx';

function SensorTab({ sensor, active, onClick }) {
  return (
    <button className={`stab ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="st-head">
        <span className="st-name">{sensor.name}</span>
        <span className={`st-dot st-dot--${sensor.status}`} />
      </div>
      <div className="st-val">
        <span className="v">{sensor.value}</span>
        <span className="u">{sensor.unit}</span>
      </div>
      <span className={`st-status st-status--${sensor.status}`}>{sensor.statusText}</span>
      <div className="st-meter">
        <div className={`st-meter-fill st-meter-fill--${sensor.status}`} style={{ width: `${sensor.meterPct}%` }} />
      </div>
    </button>
  );
}

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const { devices, currentSensorId, setSensor } = useApp();
  const { openRenameDevice } = useContext(ModalContext);

  const device = devices.find(d => d.id === deviceId);
  if (!device) return <Navigate to="/" replace />;

  const sensor = findSensor(currentSensorId);
  const chartData = makeChartData(sensor.id.length, sensor.value, Math.max(2, sensor.variance));
  const readings = makeReadings();
  const chartColor = sensor.status === 'bad' ? '#D63D3D' : sensor.status === 'moderate' ? '#EFBE1D' : '#1FA063';

  return (
    <>
      {/* Page head */}
      <div className="page-head">
        <div>
          <div className="eyebrow">Device · AERVA Home · SN {device.sn}</div>
          <h1 className="display-1">
            {device.name}
            <button className="rename-btn rename-btn--inline" onClick={() => openRenameDevice(device.id)} aria-label="Rename room">
              <IconEdit />
            </button>
          </h1>
          <div className="sub mono">Ground floor · Online · firmware v2.4.1</div>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost" onClick={() => openRenameDevice(device.id)}>
            <IconEdit /> Rename
          </button>
          <button className="btn btn-accent"><IconDownload /> Export</button>
        </div>
      </div>

      {/* Sensor tabs (horizontal-scroll on mobile) */}
      <div className="sensor-tabs-wrap">
        <div className="sensor-tabs">
          {SENSORS.map(s => (
            <SensorTab key={s.id} sensor={s} active={s.id === currentSensorId} onClick={() => setSensor(s.id)} />
          ))}
        </div>
      </div>

      {/* Educational card */}
      <div className="edu-card">
        <div className="edu-body">
          <div className="edu-eyebrow">What is {sensor.name}</div>
          <div className="edu-title">{sensor.fullName}</div>
          <div className="edu-desc">{sensor.description}</div>
          <div className="edu-bullets">
            {sensor.bullets.map((b, i) => (
              <span key={i} className="edu-bullet">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
                {b}
              </span>
            ))}
          </div>
        </div>
        <div className="edu-illust">
          <SensorIllustration sensorId={sensor.id} />
        </div>
      </div>

      {/* Reading detail + chart */}
      <div className="detail-grid-3">
        <div className="card reading-hero">
          <div className="reading-head">
            <div>
              <div className="reading-type">{sensor.type}</div>
              <div className="reading-name">{sensor.name === 'RH' ? 'Humidity' : sensor.fullName}</div>
            </div>
            <div className="live-pill"><span className="live-dot" /> LIVE</div>
          </div>

          <div className="reading-big">
            <span className="n">{sensor.value}</span>
            <span className="u">{sensor.unit}</span>
          </div>

          <div className="threshold-bar-wrap">
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

        <div className="card chart-card">
          <div className="chart-head">
            <div>
              <div className="chart-title">Historical trend</div>
              <div className="chart-sub">{sensor.name} · last 24 hours · 5 min intervals</div>
            </div>
            <div className="timeframe">
              <button className="tf-btn">1H</button>
              <button className="tf-btn active">24H</button>
              <button className="tf-btn">7D</button>
              <button className="tf-btn">30D</button>
            </div>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dgrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="time" stroke="#A8B5C8" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} interval={2} />
                <YAxis stroke="#A8B5C8" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E5EAF1', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v} ${sensor.unit}`, sensor.name]}
                />
                <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fill="url(#dgrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Last 12 readings */}
      <div className="card readings-list-card">
        <div className="chart-head">
          <div>
            <div className="chart-title">Last 12 readings</div>
            <div className="chart-sub">Auto-refresh every 30 seconds</div>
          </div>
          <span className="panel-link">Export CSV →</span>
        </div>
        <div className="readings-list">
          {readings.map((r, i) => (
            <div key={i} className="reading-row">
              <span className="reading-time">{r.t}</span>
              <span className={`reading-dot reading-dot--${r.s}`} />
              <span className="reading-val">{r.v} {sensor.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
