import mqtt from 'mqtt';
import { parseDevicePayload } from './aqi.js';

// ---- Persisted connection config (localStorage) ----
const CONFIG_KEY = 'aerva_mqtt_config';

// Support for custom broker URL via environment variable or fallback to HiveMQ
const getBrokerUrl = () => {
  // Check for explicit environment variable
  if (import.meta.env.VITE_MQTT_URL) {
    return import.meta.env.VITE_MQTT_URL;
  }
  // If running on a Netlify domain and have Render backend, use it
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production Render broker
    return 'wss://aerva-mqtt-broker.onrender.com';
  }
  // Local development
  if (window.location.hostname === 'localhost') {
    return 'ws://localhost:9001';
  }
  // Fallback: HiveMQ public broker for testing
  return 'wss://broker.hivemq.com:8884/mqtt';
};

export const DEFAULT_CONFIG = {
  // Browsers can ONLY do MQTT over WebSocket. Raw TCP 1883 will not work.
  url: getBrokerUrl(),
  username: '',
  password: '',
  mac: 'EC64C96EDA3C',
  // Topic templates — {MAC} is substituted at connect time.
  // Device publishes sensor JSON to the "pub" topic in the screenshot: AGM/pub/{MAC}
  subTopic: 'AGM/pub/{MAC}',
  pubTopic: '{MAC}/publish',
  willTopic: '{MAC}/will'
};

export function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(cfg) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) { /* ignore */ }
}

function applyMac(template, mac) {
  return (template || '').replace(/\{MAC\}/g, mac);
}

// ---- Connection manager ----
// A thin wrapper around mqtt.js that emits status + parsed messages via callbacks.
export class MqttManager {
  constructor() {
    this.client = null;
    this.config = loadConfig();
    this.status = 'idle'; // idle | connecting | connected | reconnecting | error | offline
    this.lastError = null;
    this.listeners = { status: new Set(), message: new Set() };
  }

  on(event, cb) {
    this.listeners[event]?.add(cb);
    return () => this.listeners[event]?.delete(cb);
  }

  _emit(event, ...args) {
    this.listeners[event]?.forEach(cb => {
      try { cb(...args); } catch (e) { console.error(e); }
    });
  }

  _setStatus(status, error = null) {
    this.status = status;
    this.lastError = error;
    this._emit('status', status, error);
  }

  connect(overrideConfig) {
    if (overrideConfig) {
      this.config = { ...this.config, ...overrideConfig };
      saveConfig(this.config);
    }
    this.disconnect();

    const { url, username, password, mac } = this.config;
    if (!url) {
      this._setStatus('error', 'No broker URL set');
      return;
    }

    this._setStatus('connecting');

    let client;
    try {
      client = mqtt.connect(url, {
        clientId: mac || ('aerva_web_' + Math.random().toString(16).slice(2, 8)),
        username: username || undefined,
        password: password || undefined,
        reconnectPeriod: 4000,
        connectTimeout: 8000,
        clean: true,
        will: this.config.willTopic ? {
          topic: applyMac(this.config.willTopic, mac),
          payload: JSON.stringify({ client: 'aerva-web', status: 'offline' }),
          qos: 0,
          retain: false
        } : undefined
      });
    } catch (e) {
      this._setStatus('error', e.message || 'Failed to create client');
      return;
    }

    this.client = client;

    client.on('connect', () => {
      this._setStatus('connected');
      const topic = applyMac(this.config.subTopic, mac);
      client.subscribe(topic, { qos: 0 }, (err) => {
        if (err) this._setStatus('error', 'Subscribe failed: ' + err.message);
      });
    });

    client.on('reconnect', () => this._setStatus('reconnecting'));
    client.on('offline', () => this._setStatus('offline'));
    client.on('error', (err) => this._setStatus('error', err.message || String(err)));
    client.on('close', () => {
      if (this.status === 'connected') this._setStatus('offline');
    });

    client.on('message', (topic, messageBuf) => {
      let parsed = null;
      try {
        const json = JSON.parse(messageBuf.toString());
        parsed = parseDevicePayload(json);
      } catch (e) {
        console.warn('Bad MQTT payload', e);
        return;
      }
      if (parsed) this._emit('message', parsed, topic);
    });
  }

  // Publish a command back to the device (e.g. recalibrate, set interval).
  publish(obj) {
    if (!this.client || this.status !== 'connected') return false;
    const topic = applyMac(this.config.pubTopic, this.config.mac);
    this.client.publish(topic, JSON.stringify(obj), { qos: 0 });
    return true;
  }

  disconnect() {
    if (this.client) {
      try { this.client.end(true); } catch (e) { /* ignore */ }
      this.client = null;
    }
  }
}

// Singleton — one connection shared across the app.
export const mqttManager = new MqttManager();
