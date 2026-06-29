// Derive sub-index AQI from PM2.5 using the CPCB (India) breakpoint table.
// PM2.5 is the dominant indoor pollutant, so we use it as the headline AQI proxy.
// (A full AQI blends PM10, CO, O3, etc.; for a home monitor PM2.5 is the right lead.)

const PM25_BREAKPOINTS = [
  { cLow: 0,    cHigh: 30,   iLow: 0,   iHigh: 50 },
  { cLow: 31,   cHigh: 60,   iLow: 51,  iHigh: 100 },
  { cLow: 61,   cHigh: 90,   iLow: 101, iHigh: 200 },
  { cLow: 91,   cHigh: 120,  iLow: 201, iHigh: 300 },
  { cLow: 121,  cHigh: 250,  iLow: 301, iHigh: 400 },
  { cLow: 251,  cHigh: 500,  iLow: 401, iHigh: 500 }
];

export function aqiFromPm25(pm25) {
  if (pm25 == null || isNaN(pm25)) return null;
  const c = Math.max(0, pm25);
  const bp = PM25_BREAKPOINTS.find(b => c >= b.cLow && c <= b.cHigh)
           || PM25_BREAKPOINTS[PM25_BREAKPOINTS.length - 1];
  const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow;
  return Math.round(aqi);
}

export function aqiCategory(aqi) {
  if (aqi == null) return { label: 'Unknown', status: 'off' };
  if (aqi <= 50)  return { label: 'Good',         status: 'good' };
  if (aqi <= 100) return { label: 'Satisfactory', status: 'good' };
  if (aqi <= 200) return { label: 'Moderate',     status: 'moderate' };
  if (aqi <= 300) return { label: 'Poor',         status: 'poor' };
  if (aqi <= 400) return { label: 'Very Poor',    status: 'bad' };
  return { label: 'Severe', status: 'hazardous' };
}

// Per-sensor status thresholds → returns { status, statusText, meterPct, markerPos }
export function evaluateSensor(id, value) {
  if (value == null || isNaN(value)) {
    return { status: 'off', statusText: '—', meterPct: 0, markerPos: 0 };
  }
  const clamp = (n) => Math.max(0, Math.min(100, n));

  switch (id) {
    case 'pm25': {
      const pct = clamp((value / 150) * 100);
      if (value <= 35)  return { status: 'good',     statusText: 'Good',     meterPct: pct, markerPos: pct };
      if (value <= 75)  return { status: 'moderate', statusText: 'Moderate', meterPct: pct, markerPos: pct };
      return { status: 'bad', statusText: 'Unsafe', meterPct: pct, markerPos: pct };
    }
    case 'co2': {
      const pct = clamp((value / 2500) * 100);
      if (value <= 1000) return { status: 'good',     statusText: 'Good', meterPct: pct, markerPos: pct };
      if (value <= 2000) return { status: 'poor',     statusText: 'Poor', meterPct: pct, markerPos: pct };
      return { status: 'bad', statusText: 'Bad', meterPct: pct, markerPos: pct };
    }
    case 'co': {
      const pct = clamp((value / 35) * 100);
      if (value <= 9)  return { status: 'good',     statusText: 'Safe',    meterPct: pct, markerPos: pct };
      if (value <= 35) return { status: 'moderate', statusText: 'Warning', meterPct: pct, markerPos: pct };
      return { status: 'bad', statusText: 'Danger', meterPct: pct, markerPos: pct };
    }
    case 'o2': {
      // Optimal band 19.5–23%. Map 15–25% onto the meter.
      const pct = clamp(((value - 15) / 10) * 100);
      if (value >= 19.5 && value <= 23) return { status: 'good',     statusText: 'Optimal', meterPct: pct, markerPos: pct };
      if (value >= 18)                  return { status: 'moderate', statusText: 'Low',     meterPct: pct, markerPos: pct };
      return { status: 'bad', statusText: 'Critical', meterPct: pct, markerPos: pct };
    }
    case 'temp': {
      const pct = clamp(((value - 10) / 30) * 100);
      if (value < 20)  return { status: 'moderate', statusText: 'Cool', meterPct: pct, markerPos: pct };
      if (value <= 26) return { status: 'good',     statusText: 'Optimal', meterPct: pct, markerPos: pct };
      return { status: 'moderate', statusText: 'Warm', meterPct: pct, markerPos: pct };
    }
    case 'rh': {
      const pct = clamp(value);
      if (value < 40)  return { status: 'moderate', statusText: 'Dry',     meterPct: pct, markerPos: pct };
      if (value <= 60) return { status: 'good',     statusText: 'Optimal', meterPct: pct, markerPos: pct };
      return { status: 'moderate', statusText: 'Humid', meterPct: pct, markerPos: pct };
    }
    default:
      return { status: 'good', statusText: 'OK', meterPct: 50, markerPos: 50 };
  }
}

// Map an incoming MQTT payload (per the AGM device schema) into our sensor model.
// Payload shape:
// { MAC, TIME_STATUS, TIME, env:{temp,hum}, gas:{co_ppm,o2_pct,co2_ppm},
//   pm:{pm1_0,pm2_5,pm10}, diag:{rssi,o2_warn,uptime,mqtt_err} }
export function parseDevicePayload(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const env = payload.env || {};
  const gas = payload.gas || {};
  const pm  = payload.pm  || {};
  const diag = payload.diag || {};

  const readings = {
    pm25: num(pm.pm2_5),
    pm10: num(pm.pm10),
    pm1:  num(pm.pm1_0),
    co2:  num(gas.co2_ppm),
    co:   num(gas.co_ppm),
    o2:   num(gas.o2_pct),
    temp: num(env.temp),
    rh:   num(env.hum)
  };

  const aqi = aqiFromPm25(readings.pm25);

  return {
    mac: payload.MAC || null,
    time: payload.TIME || null,
    timeStatus: payload.TIME_STATUS || null,
    readings,
    aqi,
    aqiCategory: aqiCategory(aqi),
    diag: {
      rssi: num(diag.rssi),
      o2Warn: !!diag.o2_warn,
      uptime: num(diag.uptime),
      mqttErr: num(diag.mqtt_err)
    },
    receivedAt: Date.now()
  };
}

function num(v) {
  if (v == null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}
