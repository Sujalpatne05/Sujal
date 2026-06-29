import React from 'react';

export const INITIAL_DEVICES = [
  { id: 'living-room', name: 'Living Room', room: 'living', sn: 'H487', aqi: 68, status: 'green', spark: [12,14,11,15,13,16,12,14] },
  { id: 'master-bedroom', name: 'Master Bedroom', room: 'bedroom', sn: 'H488', aqi: 54, status: 'green', spark: [10,9,11,8,10,9,11,10] },
  { id: 'kitchen', name: 'Kitchen', room: 'kitchen', sn: 'H491', aqi: 142, status: 'bad', spark: [8,10,12,14,16,18,17,19] },
  { id: 'kids-room', name: 'Kids Room', room: 'kids', sn: 'H489', aqi: 47, status: 'green', spark: [10,10,9,10,11,10,9,10] },
  { id: 'home-office', name: 'Home Office', room: 'office', sn: 'H490', aqi: 71, status: 'warn', spark: [12,13,14,12,13,15,14,15] }
];

export const INITIAL_RULES = [
  { id: 'a1', sensor: 'pm25', condition: 'above', value: 75, delayType: 'immediate', hours: 0, minutes: 0, email: '', emailOn: false, enabled: true },
  { id: 'a2', sensor: 'co2', condition: 'above', value: 1000, delayType: 'after', hours: 0, minutes: 15, email: 'ashish@zeptac.com', emailOn: true, enabled: true },
  { id: 'a3', sensor: 'temp', condition: 'above', value: 32, delayType: 'immediate', hours: 0, minutes: 0, email: '', emailOn: false, enabled: false }
];

export const ROOM_KEYS = ['living', 'bedroom', 'kitchen', 'office', 'kids', 'bathroom', 'balcony', 'other'];

export const ROOM_LABELS = {
  living: 'Living',
  bedroom: 'Bedroom',
  kitchen: 'Kitchen',
  office: 'Office',
  kids: 'Kids',
  bathroom: 'Bathroom',
  balcony: 'Balcony',
  other: 'Other'
};

export const ROOM_SUGGESTED_NAMES = {
  living: 'Living Room',
  bedroom: 'Bedroom',
  kitchen: 'Kitchen',
  office: 'Home Office',
  kids: 'Kids Room',
  bathroom: 'Bathroom',
  balcony: 'Balcony',
  other: 'New Room'
};

// Room icon components
export const RoomIcon = ({ room, className }) => {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, className };
  switch (room) {
    case 'living':
      return (<svg {...props}><path d="M2 11v8a1 1 0 0 0 1 1h2v-5h14v5h2a1 1 0 0 0 1-1v-8"/><path d="M4 11V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4"/><path d="M5 11h14"/></svg>);
    case 'bedroom':
      return (<svg {...props}><path d="M2 12v8h20v-8"/><path d="M2 12V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"/><path d="M6 12V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3M13 12V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3"/></svg>);
    case 'kitchen':
      return (<svg {...props}><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg>);
    case 'office':
      return (<svg {...props}><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="2" y1="13" x2="22" y2="13"/></svg>);
    case 'kids':
      return (<svg {...props}><circle cx="12" cy="8" r="3"/><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/></svg>);
    case 'bathroom':
      return (<svg {...props}><path d="M3 12h18M5 12V7a3 3 0 0 1 6 0M5 12v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6"/></svg>);
    case 'balcony':
      return (<svg {...props}><path d="M3 21V8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v13"/><line x1="3" y1="21" x2="21" y2="21"/><line x1="9" y1="11" x2="9" y2="21"/><line x1="15" y1="11" x2="15" y2="21"/></svg>);
    default:
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>);
  }
};

// Illustration SVGs for the education card
export const SensorIllustration = ({ sensorId }) => {
  switch (sensorId) {
    case 'aqi':
      return (<svg viewBox="0 0 200 160" fill="none">
        <circle cx="100" cy="80" r="60" fill="#FFF4D0" stroke="#EFBE1D" strokeWidth="1.5"/>
        <circle cx="100" cy="80" r="40" fill="none" stroke="#EFBE1D" strokeWidth="1" opacity="0.5"/>
        <circle cx="100" cy="80" r="20" fill="#EFBE1D" opacity="0.3"/>
        <path d="M 60 60 Q 80 50, 100 60 T 140 70" stroke="#0A2E50" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M 55 90 Q 80 80, 100 90 T 145 95" stroke="#0A2E50" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M 65 110 Q 85 102, 105 110 T 135 115" stroke="#0A2E50" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4"/>
        <circle cx="100" cy="80" r="4" fill="#0A2E50"/>
      </svg>);
    case 'pm25':
      return (<svg viewBox="0 0 200 160" fill="none">
        <rect x="40" y="80" width="120" height="60" rx="4" fill="#FFF4D0" stroke="#EFBE1D" strokeWidth="1.5"/>
        <path d="M 40 100 L 100 60 L 160 100" stroke="#EFBE1D" strokeWidth="1.5" fill="#FFFCEF"/>
        <rect x="80" y="100" width="20" height="40" fill="#0A2E50" opacity="0.2"/>
        <rect x="110" y="115" width="22" height="25" fill="#0A2E50" opacity="0.15"/>
        {[[65,40,3,0.4],[80,30,2,0.3],[120,35,2.5,0.5],[140,50,2,0.3],[50,55,2,0.4],[155,25,1.5,0.3],[100,20,2,0.4]].map(([cx,cy,r,o],i)=>(<circle key={i} cx={cx} cy={cy} r={r} fill="#0A2E50" opacity={o}/>))}
      </svg>);
    case 'co2':
      return (<svg viewBox="0 0 200 160" fill="none">
        {[[70,60,22,13],[130,50,18,10],[155,95,16,9],[50,115,14,8]].map(([cx,cy,r,fs],i)=>(<g key={i}><circle cx={cx} cy={cy} r={r} fill="#FFF4D0" stroke="#EFBE1D" strokeWidth="1.5"/><text x={cx} y={cy+5} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="700" fontSize={fs} fill="#0A2E50">CO₂</text></g>))}
      </svg>);
    case 'co':
      return (<svg viewBox="0 0 200 160" fill="none">
        <circle cx="100" cy="80" r="50" fill="#FFF4D0" stroke="#EFBE1D" strokeWidth="1.5"/>
        <text x="100" y="92" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="700" fontSize="32" fill="#0A2E50">CO</text>
        <path d="M 30 130 Q 50 110, 70 120" stroke="#EFBE1D" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M 140 30 Q 160 50, 170 45" stroke="#EFBE1D" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      </svg>);
    case 'o2':
      return (<svg viewBox="0 0 200 160" fill="none">
        <circle cx="80" cy="80" r="32" fill="#FFF4D0" stroke="#EFBE1D" strokeWidth="1.5"/>
        <text x="80" y="92" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="700" fontSize="22" fill="#0A2E50">O₂</text>
        <circle cx="140" cy="60" r="24" fill="#FFFCEF" stroke="#EFBE1D" strokeWidth="1.5"/>
        <text x="140" y="68" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="700" fontSize="16" fill="#0A2E50">O₂</text>
        <circle cx="150" cy="115" r="18" fill="#FFFCEF" stroke="#EFBE1D" strokeWidth="1.5"/>
        <text x="150" y="121" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="700" fontSize="11" fill="#0A2E50">O₂</text>
      </svg>);
    case 'temp':
      return (<svg viewBox="0 0 200 160" fill="none">
        <rect x="92" y="20" width="16" height="100" rx="8" fill="#FFFCEF" stroke="#EFBE1D" strokeWidth="1.5"/>
        <rect x="92" y="60" width="16" height="60" fill="#EFBE1D" opacity="0.4"/>
        <circle cx="100" cy="125" r="18" fill="#EFBE1D"/>
        <line x1="115" y1="40" x2="125" y2="40" stroke="#0A2E50" strokeWidth="1.5"/>
        <line x1="115" y1="70" x2="125" y2="70" stroke="#0A2E50" strokeWidth="1.5"/>
        <line x1="115" y1="100" x2="125" y2="100" stroke="#0A2E50" strokeWidth="1.5"/>
        <text x="135" y="74" fontFamily="JetBrains Mono" fontWeight="700" fontSize="14" fill="#0A2E50">28°</text>
      </svg>);
    case 'rh':
      return (<svg viewBox="0 0 200 160" fill="none">
        <path d="M 100 30 L 130 80 Q 130 110, 100 110 Q 70 110, 70 80 Z" fill="#FFF4D0" stroke="#EFBE1D" strokeWidth="1.8"/>
        <text x="100" y="92" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="700" fontSize="14" fill="#0A2E50">54%</text>
        <circle cx="50" cy="135" r="6" fill="#EFBE1D" opacity="0.6"/>
        <circle cx="160" cy="135" r="5" fill="#EFBE1D" opacity="0.5"/>
        <circle cx="100" cy="145" r="4" fill="#EFBE1D" opacity="0.7"/>
      </svg>);
    default:
      return null;
  }
};

// Generate 24-hour chart data
export function makeChartData(seed, base, variance) {
  const data = [];
  for (let i = 0; i < 24; i++) {
    const v = base + Math.sin((i + seed) * 0.5) * variance + (Math.random() - 0.5) * variance * 0.4;
    data.push({ time: `${String(i).padStart(2, '0')}:00`, value: Math.max(0, parseFloat(v.toFixed(1))) });
  }
  return data;
}

// Generate last-12 readings
export function makeReadings() {
  const readings = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const t = new Date(now.getTime() - i * 5 * 60 * 1000);
    const v = (38 + Math.sin(i * 0.7) * 6 + Math.random() * 3).toFixed(1);
    readings.push({ t: t.toTimeString().slice(0, 5), v, s: v > 35 ? 'yellow' : 'green' });
  }
  return readings;
}
