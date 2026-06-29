import React, { useState, useMemo } from 'react';
import { useApp } from '../store.jsx';
import { SENSOR_OPTIONS } from '../data/sensors.js';
import { IconSearch, IconPlus, IconTrash, IconAlert, IconWarn, IconCheck } from './icons.jsx';

// One row in the rule list
function RuleCard({ rule, onUpdate, onDelete }) {
  const opt = SENSOR_OPTIONS.find(s => s.id === rule.sensor) || SENSOR_OPTIONS[0];
  const unit = opt.unit;

  const set = (changes) => onUpdate(rule.id, changes);

  return (
    <div className={`rule-card ${!rule.enabled ? 'rule-card--off' : ''}`}>
      <div className="rule-head">
        <div className="rule-summary">
          <strong>Alert</strong> when <span className="accent">{opt.name}</span> is{' '}
          <span className="accent">{rule.condition}</span>{' '}
          <span className="accent">{rule.value}{unit && ` ${unit}`}</span>
        </div>
        <div className="rule-head-actions">
          <button className="icon-btn icon-btn--danger" onClick={() => onDelete(rule.id)} title="Delete">
            <IconTrash />
          </button>
          <label className={`toggle ${rule.enabled ? 'on' : ''}`} onClick={() => set({ enabled: !rule.enabled })} />
        </div>
      </div>

      <div className="rule-row">
        <div className="rule-field">
          <label>Sensor</label>
          <select className="rule-select" value={rule.sensor} onChange={(e) => set({ sensor: e.target.value })}>
            {SENSOR_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="rule-is">is</div>
        <div className="rule-field">
          <label>Condition</label>
          <select className="rule-select" value={rule.condition} onChange={(e) => set({ condition: e.target.value })}>
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>
        <div className="rule-field">
          <label>Threshold {unit && `(${unit})`}</label>
          <input
            type="number"
            className="rule-input"
            value={rule.value}
            onChange={(e) => set({ value: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="rule-row rule-row--delivery">
        <div className="rule-field">
          <label>Send Notification</label>
          <select className="rule-select" value={rule.delayType} onChange={(e) => set({ delayType: e.target.value })}>
            <option value="immediate">Immediately</option>
            <option value="after">After a Delay</option>
          </select>
        </div>
        {rule.delayType === 'after' && (
          <>
            <div className="rule-field">
              <label>Hours</label>
              <input
                type="number"
                className="rule-input"
                min="0" max="24"
                value={rule.hours}
                onChange={(e) => set({ hours: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="rule-field">
              <label>Minutes</label>
              <input
                type="number"
                className="rule-input"
                min="0" max="59"
                value={rule.minutes}
                onChange={(e) => set({ minutes: parseInt(e.target.value) || 0 })}
              />
            </div>
          </>
        )}
      </div>

      <div className="rule-email">
        <label className="rule-email-check">
          <input type="checkbox" checked={rule.emailOn} onChange={(e) => set({ emailOn: e.target.checked })} />
          Email recipient
        </label>
        {rule.emailOn && (
          <input
            type="email"
            className="rule-input"
            placeholder="***@example.com"
            value={rule.email}
            onChange={(e) => set({ email: e.target.value })}
          />
        )}
      </div>

      <button className="rule-update-btn" onClick={() => set({})}>Update Alert</button>
    </div>
  );
}

// Static feed view (would be live in a real backend)
function AlertFeed() {
  return (
    <>
      <div className="feed-filter-row">
        <select className="feed-filter">
          <option>Last 24 hours</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Custom range</option>
        </select>
        <span className="mono feed-count">Showing 4 events</span>
      </div>

      <div className="alerts-list">
        <div className="alert-item alert-item--critical">
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

        <div className="alert-item alert-item--warning">
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

        <div className="alert-item alert-item--cleared">
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

        <div className="alert-item alert-item--cleared">
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
    </>
  );
}

export default function AlertManagement() {
  const { alertRules, addRule, updateRule, deleteRule, showToast } = useApp();
  const [tab, setTab] = useState('manage');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return alertRules;
    const q = search.toLowerCase();
    return alertRules.filter(r => {
      const opt = SENSOR_OPTIONS.find(s => s.id === r.sensor) || {};
      return (opt.name || '').toLowerCase().includes(q) ||
             r.condition.toLowerCase().includes(q) ||
             String(r.value).includes(q);
    });
  }, [search, alertRules]);

  const handleAdd = () => {
    const newRule = {
      id: 'a' + Date.now(),
      sensor: 'pm25',
      condition: 'above',
      value: 50,
      delayType: 'immediate',
      hours: 0,
      minutes: 0,
      email: '',
      emailOn: false,
      enabled: true
    };
    addRule(newRule);
    showToast('Alert rule added');
    setTab('manage');
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this alert rule?')) return;
    deleteRule(id);
    showToast('Alert rule deleted');
  };

  return (
    <div className="alert-mgmt">
      <div className="alert-tabs-bar">
        <div className="alert-tabs-left">
          <button className={`alert-tab ${tab === 'manage' ? 'active' : ''}`} onClick={() => setTab('manage')}>
            Alert Management
          </button>
          <button className={`alert-tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>
            Alert Feed
          </button>
        </div>
        {tab === 'manage' && (
          <div className="alert-tabs-right">
            <div className="alert-search">
              <IconSearch />
              <input
                placeholder="Search alerts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-accent btn-sm" onClick={handleAdd}>
              <IconPlus /> New alert
            </button>
          </div>
        )}
      </div>

      {tab === 'manage' ? (
        <>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><IconAlert /></div>
              <div className="empty-title">No alerts match your search</div>
              <div className="empty-sub">Try a different sensor or value</div>
            </div>
          ) : (
            <div className="rule-list">
              {filtered.map(rule => (
                <RuleCard key={rule.id} rule={rule} onUpdate={updateRule} onDelete={handleDelete} />
              ))}
            </div>
          )}

          <button className="add-alert-card" onClick={handleAdd}>
            <IconPlus />
            <div className="t">Add another alert</div>
            <div className="d">Trigger a notification when a sensor reading crosses your threshold</div>
          </button>
        </>
      ) : (
        <AlertFeed />
      )}
    </div>
  );
}
