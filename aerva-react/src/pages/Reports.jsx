import React, { useState, useMemo } from 'react';
import { useApp } from '../store.jsx';
import { IconPdf, IconExcel, IconDownload } from '../components/icons.jsx';

const STATUS_COLORS = {
  Safe: '#1FA063',
  Moderate: '#C57A2B',
  Unsafe: '#D63D3D'
};

function aqiStatus(aqi) {
  if (aqi <= 100) return 'Safe';
  if (aqi <= 200) return 'Moderate';
  return 'Unsafe';
}

export default function Reports() {
  const { devices, showToast } = useApp();
  const [format, setFormat] = useState('pdf');
  const [room, setRoom] = useState('all');
  const [from, setFrom] = useState('2026-05-01');
  const [to, setTo] = useState('2026-05-24');
  const [include, setInclude] = useState({
    readings: true,
    alerts: true,
    daily: true
  });

  const rows = useMemo(() => {
    // Generate preview rows from devices
    const dates = ['20 May', '20 May', '20 May', '21 May', '21 May', '22 May', '22 May'];
    const sourceDevices = room === 'all'
      ? devices.filter(d => d.status !== 'off')
      : devices.filter(d => d.id === room);
    const out = [];
    for (let i = 0; i < dates.length; i++) {
      const d = sourceDevices[i % sourceDevices.length];
      if (!d) continue;
      const aqiBase = d.aqi || 60;
      const aqi = Math.round(aqiBase + (Math.sin(i * 1.3) * 12));
      const pm = (aqi * 0.4 + Math.random() * 5).toFixed(1);
      const co2 = Math.round(750 + Math.random() * 200);
      out.push({
        date: dates[i],
        room: d.name,
        pm,
        co2,
        aqi,
        status: aqiStatus(aqi)
      });
    }
    return out;
  }, [devices, room]);

  const toggleInclude = (key) => setInclude(p => ({ ...p, [key]: !p[key] }));

  const handleGenerate = () => {
    showToast(`Generating ${format.toUpperCase()} report for ${room === 'all' ? 'all rooms' : devices.find(d => d.id === room)?.name}…`);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="display-1">Export <em>reports</em></h1>
          <div className="sub mono">Air quality history · PDF or Excel · custom date ranges</div>
        </div>
      </div>

      <div className="reports-grid">
        {/* CONFIGURE PANEL */}
        <div className="card report-config">
          <h3 className="card-h3">Configure</h3>
          <p className="card-sub">Pick what you want in your report</p>

          <div className="field">
            <label>Format</label>
            <div className="format-row">
              <button
                className={`format-card ${format === 'pdf' ? 'active' : ''}`}
                onClick={() => setFormat('pdf')}
              >
                <IconPdf />
                <span>PDF Report</span>
              </button>
              <button
                className={`format-card ${format === 'xlsx' ? 'active' : ''}`}
                onClick={() => setFormat('xlsx')}
              >
                <IconExcel />
                <span>Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          <div className="field">
            <label>Room</label>
            <select className="select-input" value={room} onChange={(e) => setRoom(e.target.value)}>
              <option value="all">All rooms ({devices.length})</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Date range</label>
            <div className="date-row">
              <input type="date" className="date-input" value={from} onChange={(e) => setFrom(e.target.value)} />
              <input type="date" className="date-input" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Include</label>
            <div className="check-list">
              <label className="check-row">
                <input type="checkbox" checked={include.readings} onChange={() => toggleInclude('readings')} />
                <span>Sensor readings &amp; averages</span>
              </label>
              <label className="check-row">
                <input type="checkbox" checked={include.alerts} onChange={() => toggleInclude('alerts')} />
                <span>Alert log &amp; resolutions</span>
              </label>
              <label className="check-row">
                <input type="checkbox" checked={include.daily} onChange={() => toggleInclude('daily')} />
                <span>Daily summary</span>
              </label>
            </div>
          </div>

          <button className="btn btn-accent btn-block" onClick={handleGenerate}>
            <IconDownload /> Generate &amp; Download
          </button>
        </div>

        {/* PREVIEW PANEL */}
        <div className="card report-preview">
          <div className="chart-head">
            <div>
              <div className="card-h3">Preview</div>
              <div className="card-sub">Live preview · updates as you configure</div>
            </div>
            <span className="mono small-mute">Page 1 of 12</span>
          </div>

          <div className="preview-doc">
            <div className="pdoc-head">
              <div className="pdoc-brand">
                AERVA
                <small>BREATHE BETTER</small>
              </div>
              <div className="pdoc-meta">
                <div>Report ID: AER-2026-0524</div>
                <div>Generated: 24 May 2026</div>
                <div>Home: Kamble residence</div>
              </div>
            </div>

            <div className="pdoc-title">
              Home Air Quality Report — May 2026
            </div>

            <div className="pdoc-table-wrap">
              <table className="pdoc-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Room</th>
                    <th>PM2.5</th>
                    <th>CO₂</th>
                    <th>Avg AQI</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{r.room}</td>
                      <td>{r.pm}</td>
                      <td>{r.co2}</td>
                      <td>{r.aqi}</td>
                      <td style={{ color: STATUS_COLORS[r.status], fontWeight: 600 }}>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pdoc-footer">
              * Readings averaged from AERVA Home devices across {devices.length} rooms. WHO AQ guideline reference applied.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
