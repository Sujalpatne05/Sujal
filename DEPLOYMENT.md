# AERVA Deployment Guide

## Frontend Deployment (Netlify)

### Steps:
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "New site from Git"
4. Select your GitHub repository: `Sujalpatne05/Areva`
5. Build command: `npm run build` (auto-detected from netlify.toml)
6. Publish directory: `aerva-react/dist`
7. Click "Deploy site"

### Auto-Deploy:
- Any push to `main` branch will auto-deploy
- Netlify reads `netlify.toml` for configuration

### Environment Variables (Optional):
- `VITE_MQTT_URL`: Custom MQTT broker URL (defaults to Render backend)

---

## Backend Deployment (Render)

### Steps:
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "Create New" → "Web Service"
4. Connect your GitHub repository: `Sujalpatne05/Areva`
5. Configuration auto-detected from `render.yaml`
6. Select plan: **Free** (sufficient for testing)
7. Click "Deploy"

### Auto-Deploy:
- Any push to `main` branch will auto-deploy
- Render reads `render.yaml` for configuration

### What Render Will Show:
```
aerva-mqtt-broker.onrender.com
```
This is your WebSocket endpoint. Netlify frontend will auto-connect to this.

---

## Expected Behavior

### After Both Deployments Complete:

1. **Visit Netlify frontend URL**
   - Dashboard loads with UI
   - Connection status shows: "Connecting..." then "Connected" (if Render is running)
   - If no MQTT data: Shows "DEMO DATA" with static readings

2. **MQTT Data Flow** (when connected)
   - ESP32 device → sends to Render broker (port 1883 TCP or 10000 WebSocket)
   - Render broker → broadcasts to Netlify frontend
   - Frontend → displays live sensor readings

---

## Monitoring

### Netlify Dashboard:
- Deployments tab: See build logs & deploy history
- Analtyics tab: Traffic & performance

### Render Dashboard:
- Logs tab: Watch broker startup & client connections
- Metrics tab: CPU, memory, bandwidth usage

---

## Troubleshooting

### Frontend not connecting to backend:
1. Check Render service is "Live" (green status)
2. Check browser console for connection errors
3. Verify `VITE_MQTT_URL` environment variable is set correctly

### Render service goes to sleep:
- Free tier puts services to sleep after 15 minutes of inactivity
- Upgrade to paid plan for continuous uptime, or keep frontend active

### MQTT messages not appearing:
1. Ensure ESP32 device is publishing to correct topic: `AGM/pub/{MAC}`
2. Check Render logs for client connections
3. Verify MQTT credentials in device code

---

## Local Development

### Run locally first:
```bash
# Terminal 1: Frontend
cd aerva-react
npm run dev           # http://localhost:5173

# Terminal 2: Backend
node mqtt-broker.js   # ws://localhost:9001
```

### Frontend will auto-connect to `ws://localhost:9001` in dev mode.

---

## Files Included

- `render.yaml`: Render deployment config
- `aerva-react/netlify.toml`: Netlify deployment config
- `aerva-react/.env.production`: Production env vars
- `aerva-react/.env.example`: Example env template
- `mqtt-broker.js`: Updated to support Render ports
- `aerva-react/src/lib/mqttClient.js`: Smart broker URL detection

---

## Next Steps

1. Deploy backend on Render
2. Deploy frontend on Netlify
3. Test live connection
4. Configure real MQTT credentials if using authentication
5. Monitor logs & adjust as needed
