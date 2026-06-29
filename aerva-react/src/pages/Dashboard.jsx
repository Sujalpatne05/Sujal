import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, CartesianGrid, Tooltip } from 'recharts';
import { useApp } from '../store.jsx';
import { ModalContext } from '../App.jsx';
import { SENSORS } from '../data/sensors.js';
import { RoomIcon, makeChartData } from '../data/devices.jsx';
import { IconPlus, IconEdit, IconSparkle, IconChevron, IconRefresh, IconClose, IconBell, IconSettings, IconFile } from '../components/icons.jsx';

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

function AQIGauge({ value }) {
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
        <div className="gauge-unit">AQI · CPCB</div>
        <div className="gauge-status" style={{ background: color === '#D63D3D' ? 'var(--red-soft)' : color === '#EFBE1D' ? 'var(--yellow-soft)' : 'var(--green-soft)', color }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function SensorCard({ sensor, onClick }) {
  const { getLiveSensor, liveHistory } = useApp();
  const live = getLiveSensor(sensor.id);
  const value = live ? live.value : sensor.value;
  const status = live ? live.status : sensor.status;

  let spark;
  const histVals = liveHistory.map(h => h[sensor.id]).filter(v => v != null);
  if (histVals.length >= 3) {
    spark = histVals.slice(-12).map((v, i) => ({ i, v }));
  } else {
    spark = Array.from({ length: 12 }, (_, i) => ({
      i, v: value * (0.85 + Math.sin(i * 0.8) * 0.1 + Math.random() * 0.08)
    }));
  }

  const tone = status === 'moderate' ? 'yellow' : (status === 'bad' || status === 'poor') ? 'red' : status === 'off' ? 'off' : 'green';
  const displayVal = (value != null && !isNaN(value)) ? (Number.isInteger(value) ? value : Number(value).toFixed(1)) : '—';
  const trendUp = Math.random() > 0.5;

  return (
    <button className="card sensor-card" onClick={onClick} style={{border:'1px solid var(--border)'}}>
      <div className="sc-head">
        <span className="sc-name">{sensor.name}</span>
        <span className={`sc-status ${tone}`} />
      </div>
      <div className="sc-value">
        <span className="n">{displayVal}</span>
        <span className="u">{sensor.unit}</span>
      </div>
      <div className="sc-foot">
        <div className={`sc-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? '▲' : '▼'} {Math.floor(Math.random() * 15)}%
        </div>
        <svg className="sc-spark" viewBox="0 0 64 22" preserveAspectRatio="none">
          <path d="M0,15 L8,13 L16,16 L24,11 L32,12 L40,9 L48,11 L56,7 L64,8" fill="none" stroke={tone === 'red' ? '#D63D3D' : tone === 'yellow' ? '#EFBE1D' : '#1FA063'} strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const { devices, primaryRoomName, mqttStatus, live, lastUpdate, getLiveSensor } = useApp();
  const { openAddDevice, openRenameDevice } = useContext(ModalContext);
  const navigate = useNavigate();
  const [selectedSensor, setSelectedSensor] = useState(null);

  const primary = devices.find(d => d.id === 'living-room') || devices[0];
  const allSensors = SENSORS.filter(s => s.id !== 'aqi');
  const chartData = makeChartData(1, 38, 8);
  const liveAqi = getLiveSensor('aqi');
  const heroAqi = liveAqi ? liveAqi.value : (primary?.aqi || 68);
  const onlineCount = devices.filter(d => d.status !== 'off').length;
  const lastSyncText = mqttStatus === 'connected' && lastUpdate ? timeAgo(lastUpdate) : 'demo data';

  return (
    <>
      {/* PAGE HEAD */}
      <div className="page-head">
        <div>
          <div className="eyebrow">
            <span className="home-dot" style={{display:'inline-block',width:'4px',height:'4px',borderRadius:'50%',background:'var(--text-3)',marginRight:'6px'}}/>
            HOME · Overview
          </div>
          <div className="greeting mono">Good morning</div>
          <h1 className="display-1">
            How's the air <em>at home?</em>
          </h1>
          <div className="sub mono">
            {devices.length} rooms monitored · {onlineCount} online · last sync {lastSyncText}
          </div>
        </div>
        <div className="head-stats">
          <div className="head-stat">
            <div className="v"><span className="accent">{onlineCount}</span><span style={{fontSize: '13px', color:'var(--text-3)'}}>/{devices.length}</span></div>
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

      {/* LIVE READINGS SECTION HEAD */}
      <div style={{marginBottom:'20px'}}>
        <div style={{fontSize:'16px',fontWeight:'600',fontFamily:'var(--font-display)',color:'var(--text-1)',marginBottom:'2px'}}>Live readings</div>
        <div style={{fontSize:'11px',fontFamily:'var(--font-mono)',color:'var(--text-3)'}}>{primaryRoomName} · Updated {lastSyncText}</div>
      </div>

      {/* SENSOR GRID - All 6 sensors */}
      <div className="sensor-grid">
        {allSensors.map(s => (
          <SensorCard key={s.id} sensor={s} onClick={() => setSelectedSensor(s)} />
        ))}
      </div>

      {/* HOME SENSOR DETAIL PANEL (expandable) */}
      {selectedSensor && <HomeSensorDetail sensor={selectedSensor} onClose={() => setSelectedSensor(null)} />}

      {/* DASH GRID: AQI HERO + DEVICE PANEL */}
      <div className="dash-grid">
        <AQIHeroCard heroAqi={heroAqi} live={live} primary={primary} openRenameDevice={openRenameDevice} />
        <DevicePanel devices={devices} navigate={navigate} openAddDevice={openAddDevice} openRenameDevice={openRenameDevice} />
      </div>

      {/* ANALYTICS ROW: Chart + AI Insights */}
      <div className="analytics-row">
        <ChartCard chartData={chartData} primaryRoomName={primaryRoomName} lastSyncText={lastSyncText} />
        <AICard />
      </div>
    </>
  );
}

function AQIHeroCard({ heroAqi, live, primary, openRenameDevice }) {
  const co2 = live?.readings?.co2 ?? 400;
  const pm25 = live?.readings?.pm25 ?? 20;
  const mac = live?.mac ?? 'EDA3C';

  return (
    <div className="card aqi-hero">
      <div className="aqi-head">
        <div className="lbl">
          <div className="eyebrow" style={{color:'var(--aerva-yellow-deep)'}}>Whole-home AQI</div>
          <div className="name" style={{fontFamily:'var(--font-display)',fontSize:'22px',fontWeight:'600',color:'var(--text-1)',display:'flex',alignItems:'center',gap:'8px'}}>
            {primary?.name || 'Living Room'}
            <button className="rename-btn" onClick={() => openRenameDevice('living-room')} title="Rename" style={{width:'28px',height:'28px',borderRadius:'6px',display:'grid',placeItems:'center',color:'var(--text-3)',transition:'all 0.18s',opacity:1,background:'transparent'}}>
              <IconEdit/>
            </button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px',fontFamily:'var(--font-mono)',fontSize:'11px',color:'var(--text-3)'}}>
            <span>AERVA Home · SN H487</span>
          </div>
        </div>
        <div className="live-pill" style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <span className="live-dot" style={{width:'6px',height:'6px',borderRadius:'50%',background:'var(--green)',animation:'blink 1.6s ease-in-out infinite'}}/>
          LIVE
        </div>
      </div>

      <div className="gauge-row">
        <AQIGauge value={heroAqi} />
        <div className="aqi-breakdown">
          <div className="bd-row">
            <span className="k">CO₂</span>
            <div className="bd-bar">
              <div className="fill" style={{ width: `${Math.min(co2 / 2000 * 100, 100)}%` }} />
            </div>
            <span className="v">{co2}<span className="u">ppm</span></span>
          </div>
          <div className="bd-row">
            <span className="k">PM2.5</span>
            <div className="bd-bar">
              <div className="fill" style={{ width: `${Math.min(pm25 / 100 * 100, 100)}%` }} />
            </div>
            <span className="v">{pm25}<span className="u">μg/m³</span></span>
          </div>
          <div className="bd-row">
            <span className="k">Device</span>
            <div style={{ flex: 1 }} />
            <span className="v">{mac.slice(-6)}</span>
          </div>
          <Link to="/devices/living-room" className="gauge-cta" style={{display:'inline-flex',alignItems:'center',gap:'6px',marginTop:'14px',padding:'9px 16px',background:'var(--aerva-blue)',color:'#fff',borderRadius:'10px',fontSize:'13px',fontWeight:'600',textDecoration:'none',alignSelf:'flex-start',transition:'background 0.18s, transform 0.18s'}}>
            Detail <IconChevron style={{width:'15px',height:'15px'}}/>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DevicePanel({ devices, navigate, openAddDevice, openRenameDevice }) {
  return (
    <div className="card device-panel">
      <div className="panel-head">
        <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:'600',color:'var(--text-1)'}}>Your devices</div>
      </div>

      <button className="add-device-btn" onClick={openAddDevice} style={{width:'100%',padding:'14px',border:'1.5px dashed var(--border-strong)',borderRadius:'12px',color:'var(--text-2)',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',fontSize:'13px',fontWeight:'500',transition:'all 0.18s',marginTop:'10px',background:'transparent',minHeight:'50px'}}>
        <IconPlus style={{width:'16px',height:'16px'}}/>
        Add Device
      </button>

      <div className="device-list">
        {devices.map(d => (
          <div key={d.id} className="device-row" onClick={() => navigate(`/devices/${d.id}`)} style={{display:'grid',gridTemplateColumns:'auto 1fr auto auto',gap:'14px',alignItems:'center',padding:'14px',borderRadius:'12px',border:'1px solid var(--border-soft)',background:'var(--surface-2)',cursor:'pointer',transition:'all 0.2s',minHeight:'60px'}}>
            <div className={`status-dot ${d.status === 'good' ? '' : d.status === 'warn' ? 'warn' : 'off'}`} style={{width:'8px',height:'8px',borderRadius:'50%',background:d.status==='off'?'var(--text-mute)':d.status==='warn'?'var(--aerva-yellow)':'var(--green)',position:'relative'}} />
            <div className="device-info">
              <div className="device-name" style={{fontSize:'13.5px',fontWeight:'600',color:'var(--text-1)',display:'flex',alignItems:'center',gap:'6px'}}>
                <RoomIcon room={d.room} style={{width:'14px',height:'14px',color:'var(--text-3)',flexShrink:0}}/>
                {d.name}
              </div>
              <div className="device-loc" style={{fontFamily:'var(--font-mono)',fontSize:'10.5px',color:'var(--text-3)',marginTop:'2px'}}>{d.sn}</div>
            </div>
            <div className="device-aqi" style={{fontFamily:'var(--font-mono)',fontSize:'15px',fontWeight:'600',color:'var(--text-1)',textAlign:'right',lineHeight:'1.1'}}>
              {d.aqi}<small style={{fontSize:'9px',color:'var(--text-3)',display:'block',letterSpacing:'1px',marginTop:'2px',fontWeight:'400'}}>AQI</small>
            </div>
            <button className="device-action" onClick={(e) => { e.stopPropagation(); openRenameDevice(d.id); }} title="Rename" style={{width:'32px',height:'32px',borderRadius:'8px',display:'grid',placeItems:'center',color:'var(--text-3)',transition:'all 0.15s',background:'transparent'}}>
              <IconEdit style={{width:'14px',height:'14px'}}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeSensorDetail({ sensor, onClose }) {
  const { getLiveSensor, primaryRoomName } = useApp();
  const live = getLiveSensor(sensor.id);
  const value = live ? live.value : sensor.value;
  const lastSyncText = 'just now';

  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow)',padding:'24px',marginBottom:'20px',animation:'fadeIn 0.3s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
        <div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'10.5px',letterSpacing:'2px',textTransform:'uppercase',color:'var(--text-3)',fontWeight:'500'}}>Sensor Detail</div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'24px',fontWeight:'600',color:'var(--text-1)',marginTop:'4px'}}>{sensor.name}</h2>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'11px',color:'var(--text-3)',marginTop:'4px'}}>{sensor.name} · {primaryRoomName}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div className="live-pill" style={{display:'flex',alignItems:'center',gap:'6px',fontFamily:'var(--font-mono)',fontSize:'10.5px',letterSpacing:'1.2px',textTransform:'uppercase',color:'var(--green)',padding:'5px 10px',background:'var(--green-soft)',borderRadius:'20px'}}>
            <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'var(--green)',animation:'blink 1.6s ease-in-out infinite'}}/>
            LIVE
          </div>
          <button className="icon-btn" onClick={onClose} title="Close" style={{width:'40px',height:'40px',borderRadius:'10px',display:'grid',placeItems:'center',color:'var(--text-2)',transition:'all 0.18s',background:'transparent'}}>
            <IconClose style={{width:'17px',height:'17px'}}/>
          </button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}>
        <div>
          <div style={{display:'flex',alignItems:'baseline',gap:'12px'}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'60px',fontWeight:'500',color:'var(--text-1)',lineHeight:'1',letterSpacing:'-0.5px'}}>{value}</div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:'13px',color:'var(--text-3)',letterSpacing:'1px'}}>{sensor.unit}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'12px',paddingTop:'16px',borderTop:'1px solid var(--border-soft)',marginTop:'16px'}}>
            {[
              {label:'24h Avg',value:'38.6'},
              {label:'Peak today',value:'61.2'},
              {label:'Variance',value:'±8.4'}
            ].map((s,i)=>(
              <div key={i}>
                <div style={{fontFamily:'var(--font-mono)',fontSize:'9.5px',letterSpacing:'1.2px',textTransform:'uppercase',color:'var(--text-3)',marginBottom:'4px',fontWeight:'600'}}>{s.label}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:'16px',fontWeight:'600',color:'var(--text-1)'}}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{paddingLeft:'20px',borderLeft:'1px solid var(--border-soft)'}}>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'10.5px',letterSpacing:'1.8px',textTransform:'uppercase',color:'var(--aerva-yellow-deep)',fontWeight:'600',marginBottom:'6px'}}>What is {sensor.name}</div>
          <div style={{fontSize:'13px',color:'var(--text-2)',lineHeight:'1.65'}}>{sensor.description || 'Real-time sensor data for monitoring air quality.'}</div>
        </div>
      </div>
      <div style={{marginTop:'20px',paddingTop:'16px',borderTop:'1px solid var(--border-soft)',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'11px',fontFamily:'var(--font-mono)',color:'var(--text-3)'}}>
        Updated {lastSyncText} · {primaryRoomName}
      </div>
    </div>
  );
}

function ChartCard({ chartData, primaryRoomName, lastSyncText }) {
  const [timeframe, setTimeframe] = useState('24h');

  return (
    <div className="card chart-card">
      <div className="chart-head">
        <div className="chart-title-block">
          <div className="chart-title">PM2.5 trend</div>
          <div className="chart-sub">Last 24 hours · {primaryRoomName}</div>
        </div>
        <div className="timeframe" style={{display:'flex',gap:'2px',background:'var(--surface-2)',padding:'3px',borderRadius:'10px',border:'1px solid var(--border)'}}>
          {['1H','24H','7D'].map(tf=>(
            <button key={tf} className={`tf-btn ${timeframe===tf?'active':''}`} onClick={()=>setTimeframe(tf)} style={{padding:'6px 12px',borderRadius:'8px',fontFamily:'var(--font-mono)',fontSize:'11px',fontWeight:'600',letterSpacing:'0.5px',color:timeframe===tf?'#fff':'var(--text-3)',background:timeframe===tf?'var(--aerva-blue)':'transparent',transition:'all 0.18s'}}>
              {tf}
            </button>
          ))}
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
  );
}

function AICard() {
  return (
    <div className="card ai-card">
      <div className="ai-head" style={{display:'flex',alignItems:'center',gap:'10px'}}>
        <div className="ai-icon" style={{width:'32px',height:'32px',borderRadius:'9px',background:'linear-gradient(135deg, #FFF4D0, #FFFCEF)',border:'1px solid var(--aerva-yellow)',display:'grid',placeItems:'center',color:'var(--aerva-yellow-deep)'}}>
          <IconSparkle style={{width:'16px',height:'16px'}}/>
        </div>
        <div>
          <div className="chart-title" style={{fontSize:'16px'}}>AI Insights</div>
          <div className="chart-sub" style={{fontFamily:'var(--font-mono)',fontSize:'11px',color:'var(--text-3)'}}>This week</div>
        </div>
      </div>
      <div style={{padding:'14px',borderRadius:'12px',background:'var(--surface-2)',border:'1px solid var(--border-soft)',borderLeft:'3px solid var(--aerva-yellow)'}}>
        <div style={{fontSize:'13px',fontWeight:'600',color:'var(--text-1)',marginBottom:'4px'}}>🍳 Kitchen spike at 7 PM</div>
        <div style={{fontSize:'12px',color:'var(--text-2)',lineHeight:'1.55'}}>PM2.5 rises during dinner prep. Run exhaust fan before and after cooking.</div>
        <div style={{marginTop:'8px',fontFamily:'var(--font-mono)',fontSize:'10.5px',color:'var(--aerva-yellow-deep)',letterSpacing:'1px',textTransform:'uppercase',fontWeight:'600',cursor:'pointer'}}>Learn more</div>
      </div>
      <div style={{padding:'14px',borderRadius:'12px',background:'var(--green-soft)',border:'1px solid var(--green-soft)',borderLeft:'3px solid var(--green)'}}>
        <div style={{fontSize:'13px',fontWeight:'600',color:'var(--text-1)',marginBottom:'4px'}}>✓ CO₂ levels stable</div>
        <div style={{fontSize:'12px',color:'var(--text-2)',lineHeight:'1.55'}}>Average CO₂ across all rooms is well below unhealthy levels.</div>
        <div style={{marginTop:'8px',fontFamily:'var(--font-mono)',fontSize:'10.5px',color:'var(--green)',letterSpacing:'1px',textTransform:'uppercase',fontWeight:'600',cursor:'pointer'}}>Learn more</div>
      </div>
    </div>
  );
}
