import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconAlert, IconWarn, IconCheck } from '../components/icons.jsx';

export default function Alerts() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow-home" style={{ background: 'var(--red)' }}>
            <span className="home-dot" style={{ background: '#fff', boxShadow: '0 0 0 3px rgba(255,255,255,0.3)' }} />
            MONITOR · Alert Feed
          </div>
          <h1 className="display-1">Alert <em>feed</em></h1>
          <div className="sub mono">Recent threshold events across all rooms · Live · Last sync 14 sec ago</div>
        </div>
        <div className="head-stats">
          <div className="head-stat">
            <div className="v" style={{ color: 'var(--red)' }}>2</div>
            <div className="l">Active</div>
          </div>
          <div className="div" />
          <div className="head-stat">
            <div className="v">4</div>
            <div className="l">Last 24h</div>
          </div>
          <div className="div" />
          <div className="head-stat">
            <div className="v">12</div>
            <div className="l">Last 7d</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div className="feed-filter-row">
          <select className="feed-filter">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Custom range</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--text-3)' }}>Showing 4 events</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/settings/alerts')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Manage alert rules
            </button>
          </div>
        </div>

        <div className="alerts-list">
          <div className="alert-item critical">
            <div className="alert-icon"><IconAlert /></div>
            <div className="alert-body">
              <div className="alert-title">PM2.5 above 75 μg/m³ in Kitchen</div>
              <div className="alert-desc">Reading hit 89 μg/m³ during cooking. Turn on the exhaust fan and crack a window.</div>
              <div className="alert-meta">
                <span>● Kitchen · H491</span>
                <span>⏱ 2 min ago</span>
              </div>
            </div>
            <div className="alert-value">89 μg/m³</div>
          </div>

          <div className="alert-item warning">
            <div className="alert-icon"><IconWarn /></div>
            <div className="alert-body">
              <div className="alert-title">CO₂ above 900 ppm in Master Bedroom</div>
              <div className="alert-desc">Approaching 1000 ppm overnight. Consider keeping a window open or running ventilation.</div>
              <div className="alert-meta">
                <span>● Master Bedroom · H487</span>
                <span>⏱ 14 min ago</span>
              </div>
            </div>
            <div className="alert-value">912 ppm</div>
          </div>

          <div className="alert-item cleared">
            <div className="alert-icon"><IconCheck /></div>
            <div className="alert-body">
              <div className="alert-title">Humidity below 65% in Bathroom</div>
              <div className="alert-desc">RH was 82% after a shower. Returned to 58% within 40 minutes. Auto-resolved.</div>
              <div className="alert-meta">
                <span>● Bathroom · H490</span>
                <span>⏱ 3 hr ago · resolved</span>
              </div>
            </div>
            <div className="alert-value">58%</div>
          </div>

          <div className="alert-item cleared">
            <div className="alert-icon"><IconCheck /></div>
            <div className="alert-body">
              <div className="alert-title">Living Room device reconnected</div>
              <div className="alert-desc">H487 went offline at 09:14 due to WiFi timeout. Reconnected at 09:18.</div>
              <div className="alert-meta">
                <span>● Living Room · H487</span>
                <span>⏱ 5 hr ago · resolved</span>
              </div>
            </div>
            <div className="alert-value">Online</div>
          </div>
        </div>

        <div className="feed-note">
          <b>Note:</b> Alert feed will be permanently deleted after a 30-day period.
        </div>
      </div>
    </>
  );
}
