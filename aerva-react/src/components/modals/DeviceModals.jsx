import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../store.jsx';
import { ROOM_KEYS, ROOM_LABELS, ROOM_SUGGESTED_NAMES, RoomIcon } from '../../data/devices.jsx';
import { IconClose, IconPlus, IconTrash, IconQR, IconWifi } from '../icons.jsx';

function useEscapeKey(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);
}

export function AddDeviceModal({ open, onClose }) {
  const { addDevice, showToast } = useApp();
  const [name, setName] = useState('');
  const [room, setRoom] = useState('living');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName('');
      setRoom('living');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEscapeKey(open, onClose);

  const pickRoom = (key) => {
    setRoom(key);
    if (!name.trim()) setName(ROOM_SUGGESTED_NAMES[key]);
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
    const sn = 'H' + Math.floor(490 + Math.random() * 100);
    addDevice({
      id, name: trimmed, room, sn,
      aqi: Math.floor(40 + Math.random() * 40),
      status: 'green',
      spark: Array.from({ length: 8 }, () => 10 + Math.random() * 6)
    });
    showToast(`${trimmed} added — checking sensors…`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-labelledby="add-device-title">
        <div className="modal-head">
          <h3 id="add-device-title">Add a new device</h3>
          <button className="x" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Device name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="e.g. Living Room, Bedroom, Office"
            />
          </div>

          <div className="field">
            <label>Room type</label>
            <div className="room-picker">
              {ROOM_KEYS.map(key => (
                <div
                  key={key}
                  className={`room-opt ${room === key ? 'active' : ''}`}
                  onClick={() => pickRoom(key)}
                >
                  <RoomIcon room={key} />
                  <span className="lab">{ROOM_LABELS[key]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Setup method</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { onClose(); setTimeout(() => window.location.assign('/onboarding'), 50); }}>
                <IconQR /> Scan QR
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }}>
                <IconWifi /> WiFi pair
              </button>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" onClick={submit}>
            <IconPlus /> Add device
          </button>
        </div>
      </div>
    </div>
  );
}

export function RenameDeviceModal({ open, deviceId, onClose }) {
  const { devices, updateDevice, deleteDevice, showToast } = useApp();
  const device = devices.find(d => d.id === deviceId);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('living');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && device) {
      setName(device.name);
      setRoom(device.room);
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 100);
    }
  }, [open, device]);

  useEscapeKey(open, onClose);

  if (!open || !device) return null;

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateDevice(device.id, { name: trimmed, room });
    showToast(`Renamed to "${trimmed}"`);
    onClose();
  };

  const remove = () => {
    if (!confirm(`Remove "${device.name}" from your network? Sensor data will be archived.`)) return;
    deleteDevice(device.id);
    showToast(`"${device.name}" removed`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog">
        <div className="modal-head">
          <h3>Rename device</h3>
          <button className="x" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>New name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
          </div>

          <div className="field">
            <label>Room type</label>
            <div className="room-picker">
              {ROOM_KEYS.map(key => (
                <div
                  key={key}
                  className={`room-opt ${room === key ? 'active' : ''}`}
                  onClick={() => setRoom(key)}
                >
                  <RoomIcon room={key} />
                  <span className="lab">{ROOM_LABELS[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-danger" onClick={remove} style={{ marginRight: 'auto' }}>
            <IconTrash /> Remove
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  );
}
