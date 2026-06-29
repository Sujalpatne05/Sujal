# AERVA — Air Quality Dashboard

A React + Vite + PWA app for monitoring indoor air quality across rooms in a residential home.
Built for **Zeptac** by Ashish Kamble.

## Stack

- **React 18** with React Router (HashRouter / BrowserRouter)
- **Vite 5** for dev / build
- **vite-plugin-pwa** with Workbox runtime caching → offline-capable + installable
- **Recharts** for sparklines and historical trend charts
- **mqtt.js** for live MQTT-over-WebSocket data from the AERVA device
- Mobile-first CSS with safe-area-inset support (iOS notch / Android nav-bar)

## Live data (MQTT)

The app connects to your MQTT broker over WebSocket and streams live readings
from the AERVA device. Configure it in-app under **Settings → Connection** — no
code changes needed. **Your broker must expose a WebSocket listener** (browsers
cannot use raw TCP port 1883). Full instructions, including the Mosquitto config
and nginx TLS proxy, are in **[MQTT_SETUP.md](./MQTT_SETUP.md)**.

When no broker is configured the app falls back to realistic demo data, clearly
labelled **DEMO DATA**, so the UI is always reviewable.

## Getting started

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Open <http://localhost:5173>. The service worker is registered in dev too (via `devOptions.enabled: true` in `vite.config.js`).

### Production build

```bash
npm run build
npm run preview
```

The build outputs to `dist/`. You can deploy that directory to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 + CloudFront, nginx, etc.).

## PWA — installing on a device

After deploying (or via `npm run preview`), open the app in Chrome / Safari / Edge:

- **iOS Safari**: Share button → "Add to Home Screen"
- **Android Chrome**: tap the install prompt that appears, or use the ⋮ menu → "Install app"
- **Desktop Chrome / Edge**: install icon appears in the address bar

Once installed, the app launches full-screen (no browser chrome), has its own home-screen icon, and works offline for the shell + cached fonts.

## Mobile responsiveness

The layout breaks at:

| Width        | Behaviour                                                              |
| ------------ | ---------------------------------------------------------------------- |
| ≥ 1280 px    | Full desktop: sidebar (260 px), 3-column dashboard grid                |
| 1024–1280 px | Sensor grid drops to 3 columns, analytics stacks vertically            |
| 768–1024 px  | Detail / report / settings grids stack; settings nav scrolls sideways  |
| ≤ 768 px     | Sidebar becomes a slide-out drawer, mobile bottom-tab nav appears, modals become bottom sheets, sensor tabs become a horizontal carousel, alert rule fields stack |
| ≤ 480 px     | Display sizes tighten further; room picker drops to 3 columns          |

Touch targets are ≥ 40 px. `safe-area-inset-*` is honoured everywhere (status bar, home indicator, side notches in landscape).

## Project layout

```
aerva-react/
├── index.html                     # PWA meta + font preconnects
├── package.json
├── vite.config.js                 # PWA plugin + workbox config
├── public/
│   ├── icon-192.png               # PWA icons (generated)
│   ├── icon-512.png
│   ├── icon-maskable-512.png      # Android adaptive
│   ├── apple-touch-icon.png       # iOS
│   ├── favicon.png / favicon.svg
│   └── icon.svg                   # vector logo
└── src/
    ├── main.jsx                   # entry — registers service worker
    ├── App.jsx                    # routes + modal context provider
    ├── index.css                  # all styles (tokens → utilities → responsive)
    ├── store.jsx                  # AppContext + useReducer (devices, alertRules, toast)
    ├── data/
    │   ├── sensors.js             # SENSORS array, educational descriptions
    │   └── devices.js             # INITIAL_DEVICES, RoomIcon, SensorIllustration
    ├── components/
    │   ├── icons.jsx              # all SVG icons
    │   ├── Layout.jsx             # Sidebar, TopBar, MobileNav, Toast
    │   ├── AlertManagement.jsx    # the rule builder + Alert Feed
    │   └── modals/
    │       └── DeviceModals.jsx   # Add device + Rename device
    └── pages/
        ├── Dashboard.jsx          # AQI gauge + sensor cards + trend + insights
        ├── DeviceDetail.jsx       # sensor tabs + education card + chart + readings
        ├── Settings.jsx           # General / Notifications / Alerts / Devices / Account
        ├── Reports.jsx            # PDF/Excel config + live preview
        └── Onboarding.jsx         # 5-step add-device wizard
```

## Routes

| Path                   | Page              |
| ---------------------- | ----------------- |
| `/`                    | Dashboard         |
| `/devices/:deviceId`   | Device detail     |
| `/settings`            | → `/settings/general` |
| `/settings/:section`   | Settings (sub-section: general / notifications / alerts / devices / account) |
| `/reports`             | Reports           |
| `/onboarding`          | Add-device wizard |

The top-level "Alerts" links in the sidebar and bottom tab nav both route to `/settings/alerts`, which renders `<AlertManagement />` inside the Settings shell — matching the reference design where Alerts lives inside Settings.

## Notes

- All device state is held in `store.jsx` via `useReducer`. Data persists for the session only; a backend hookup would replace the initial state and add side-effect action creators.
- The toast component listens to `state.toast` and auto-clears after 3 seconds.
- Modals are mounted at the App root so any page can open them via `ModalContext`.
- The Kitchen device is preset to AQI 142 (red/bad status) for demo purposes.

---

© Zeptac — AERVA platform
