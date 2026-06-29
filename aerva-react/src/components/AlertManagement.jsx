import React, { useState, useMemo } from 'react';
import { useApp } from '../store.jsx';
import { SENSOR_OPTIONS } from '../data/sensors.js';
import { IconSearch, IconPlus, IconTrash, IconAlert, IconWarn, IconCheck } from './icons.jsx';

function RuleCard({ rule, onUpdate, onDelete }) {
  const opt = SENSOR_OPTIONS.find(s => s.id === rule.sensor) || SENSOR_OPTIONS[0];
  const unit = opt.unit;
  const set = (changes) => onUpdate(rule.id, changes);

  return (
    <div className={`alert-rule${!rule.enabled ? ' off' : ''}`}>
      <div className="ar-summary">
        <div className="ar-title">
          <span className="strong">Alert</span> when <span className="strong">{opt.name}</span> is{' '}
          <span className="strong">{rule.condition}</span>{' '}
          <span className="strong">{rule.value}{unit && ` ${unit}`}</span>
        </div>
        <div className="ar-controls">
          <button className="ar-delete" onClick={() => onDelete(rule.id)} title="Delete">
            <IconTrash />
          </button>
          <div
            className={`ar-toggle${rule.enabled ? ' on' : ''}`}
            onClick={() => set({ enabled: !rule.enabled })}
          />
        </div>
      </div>

      <div className="ar-body">
        <div className="ar-field">
          <div className="ar-field-label">Sensor</div>
          <select className="ar-select" value={rule.sensor} onChange={(e) => set({ sensor: e.target.value })}>
            {SENSOR_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="ar-is">is</div>
        <div className="ar-field">
          <div className="ar-field-label">Condition</div>
          <select className="ar-select" value={rule.condition} onChange={(e) => set({ condition: e.target.value })}>
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>
        <div className="ar-field">
          <div className="ar-field-label">Threshold {unit && `(${unit})`}</div>
          <input
            type="number"
            className="ar-input"
            value={rule.value}
            onChange={(e) => set({ value: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="ar-extra">
        <div className="ar-field">
          <div className="ar-field-label">Send Notification</div>
          <select className="ar-select" value={rule.delayType} onChange={(e) => set({ delayType: e.target.value })}>
            <option value="immediate">Immediately</option>
            <option value="after">After a Delay</option>
          </select>
        </div>
        {rule.delayType === 'after' && (
          <>
            <div className="ar-field">
              <div className="ar-field-label">Hours</div>
              <input
                type="number"
                className="ar-input"
                min="0" max="24"
                value={rule.hours}
                onChange={(e) => set({ hours: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="ar-field">
              <div className="ar-field-label">Minutes</div>
              <input
                type="number"
                className="ar-input"
                min="0" max="59"
                value={rule.minutes}
                onChange={(e) => set({ minutes: parseInt(e.target.value) || 0 })}
              />
            </div>
          </>
        )}
      </div>

      <div className="ar-email-row">
        <label className="ar-email-check">
          <input type="checkbox" checked={rule.emailOn} onChange={(e) => set({ emailOn: e.target.checked })} />
          Email recipient
        </label>
        {rule.emailOn && (
          <input
            type="email"
            className="ar-input"
            placeholder="***@example.com"
            value={rule.email}
            onChange={(e) => set({ email: e.target.value })}
          />
        )}
      </div>
    </div>
  );
}

export default function AlertManagement() {
  const { alertRules, addRule, updateRule, deleteRule, showToast } = useApp();
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
    addRule({
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
    });
    showToast('Alert rule added');
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this alert rule?')) return;
    deleteRule(id);
    showToast('Alert rule deleted');
  };

  return (
    <div>
      <div className="alert-tabs-bar">
        <div className="alert-tabs-left">
          <button className="alert-tab active">Alert Management</button>
        </div>
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
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
          <IconAlert style={{ width: '32px', height: '32px', marginBottom: '10px', opacity: 0.4 }} />
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>No alerts match your search</div>
          <div style={{ fontSize: '12px' }}>Try a different sensor or value</div>
        </div>
      ) : (
        <div>
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
    </div>
  );
}
