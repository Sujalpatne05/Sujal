import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { ROOM_LABELS, ROOM_SUGGESTED_NAMES, RoomIcon } from '../data/devices.jsx';
import { Logo } from '../components/Layout.jsx';
import { IconQR, IconWifi, IconCheck, IconClose, IconChevron } from '../components/icons.jsx';

const STEPS = [
  { key: 'select', label: 'Select' },
  { key: 'scan', label: 'Scan QR' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'name', label: 'Name room' },
  { key: 'done', label: 'Done' }
];

function Stepper({ current }) {
  return (
    <div className="stepper">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={step.key}>
            <div className={`step ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
              <div className="step-dot">{done ? <IconCheck /> : i + 1}</div>
              <div className="step-label">{step.label}</div>
            </div>
            {i < STEPS.length - 1 && <div className={`step-bar ${done ? 'done' : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StepSelect({ onPick }) {
  return (
    <div className="qr-card">
      <Logo />
      <h2 className="onboard-title">Let's add your AERVA Home</h2>
      <p className="onboard-sub">Choose how you'd like to connect your device.</p>
      <div className="onboard-options">
        <button className="onboard-opt" onClick={() => onPick('scan')}>
          <IconQR />
          <div className="oo-meta">
            <div className="oo-t">Scan QR code</div>
            <div className="oo-d">Use your camera to scan the sticker on the back</div>
          </div>
          <IconChevron />
        </button>
        <button className="onboard-opt" onClick={() => onPick('wifi')}>
          <IconWifi />
          <div className="oo-meta">
            <div className="oo-t">WiFi pairing</div>
            <div className="oo-d">Hold the device button until it blinks yellow</div>
          </div>
          <IconChevron />
        </button>
      </div>
    </div>
  );
}

function StepScan({ onNext }) {
  return (
    <div className="qr-card">
      <h2 className="onboard-title">Point at the QR code</h2>
      <p className="onboard-sub">The QR sticker is on the back of your AERVA Home device, near the WiFi antenna.</p>
      <div className="qr-scanner">
        <div className="qr-frame">
          <span className="qr-corner tl" />
          <span className="qr-corner tr" />
          <span className="qr-corner bl" />
          <span className="qr-corner br" />
          <div className="qr-scan-line" />
        </div>
      </div>
      <button className="btn btn-accent btn-block" onClick={onNext}>
        Continue
      </button>
    </div>
  );
}

function StepWifi({ onNext }) {
  const [ssid, setSsid] = useState('Kamble_Home_5G');
  const [pass, setPass] = useState('');
  return (
    <div className="qr-card">
      <h2 className="onboard-title">Connect to WiFi</h2>
      <p className="onboard-sub">AERVA Home works best on 2.4 GHz networks. We'll handle the rest.</p>
      <div className="onboard-form">
        <div className="field">
          <label>Network name</label>
          <input className="select-input" value={ssid} onChange={(e) => setSsid(e.target.value)} />
        </div>
        <div className="field">
          <label>Password</label>
          <input className="select-input" type="password" placeholder="Enter WiFi password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
      </div>
      <button className="btn btn-accent btn-block" onClick={onNext}>
        Connect
      </button>
    </div>
  );
}

function StepName({ onNext }) {
  const { addDevice } = useApp();
  const [room, setRoom] = useState('living');
  const [name, setName] = useState(ROOM_SUGGESTED_NAMES.living);

  const handleRoom = (r) => {
    setRoom(r);
    setName(ROOM_SUGGESTED_NAMES[r] || '');
  };

  const handleSave = () => {
    addDevice({ name: name.trim() || ROOM_SUGGESTED_NAMES[room], room });
    onNext();
  };

  return (
    <div className="qr-card">
      <h2 className="onboard-title">Where is it placed?</h2>
      <p className="onboard-sub">Picking a room helps us tailor your insights and alert recommendations.</p>
      <div className="field">
        <label>Room type</label>
        <div className="room-picker">
          {Object.keys(ROOM_LABELS).map(key => (
            <button
              key={key}
              className={`room-opt ${room === key ? 'active' : ''}`}
              onClick={() => handleRoom(key)}
            >
              <RoomIcon room={key} />
              <span className="lab">{ROOM_LABELS[key]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Device name</label>
        <input className="select-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Living Room" />
      </div>
      <button className="btn btn-accent btn-block" onClick={handleSave}>
        Save device
      </button>
    </div>
  );
}

function StepDone() {
  const navigate = useNavigate();
  return (
    <div className="qr-card qr-card--done">
      <div className="done-icon"><IconCheck /></div>
      <h2 className="onboard-title">You're all set</h2>
      <p className="onboard-sub">Your AERVA Home device is online and reporting. You'll see the first readings on your dashboard within a few seconds.</p>
      <button className="btn btn-accent btn-block" onClick={() => navigate('/')}>
        Go to dashboard
      </button>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const handlePick = (mode) => {
    // QR or WiFi — both jump to step 1 (scan) then proceed
    setStep(mode === 'scan' ? 1 : 2);
  };

  return (
    <div className="onboard-bleed">
      <div className="onboard-topbar">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label="Close onboarding">
          <IconClose />
        </button>
        <div className="onboard-title-bar">Add a device</div>
        <span style={{ width: 36 }} />
      </div>

      <Stepper current={step} />

      <div className="onboard-stage">
        {step === 0 && <StepSelect onPick={handlePick} />}
        {step === 1 && <StepScan onNext={() => setStep(2)} />}
        {step === 2 && <StepWifi onNext={() => setStep(3)} />}
        {step === 3 && <StepName onNext={() => setStep(4)} />}
        {step === 4 && <StepDone />}
      </div>
    </div>
  );
}
