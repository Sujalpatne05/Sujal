# AERVA — Live MQTT Setup Guide

This app streams live air-quality data from your AERVA device over MQTT.
Follow these steps to connect it to your broker.

## 1. Why your broker needs a WebSocket listener

Your device publishes to MQTT on **port 1883 (raw TCP)**. That works for the
ESP32 and native phone apps — but **web browsers cannot open raw TCP sockets**.
A browser can only speak MQTT over **WebSocket**. So the broker needs a second
listener that accepts WebSocket connections. The device keeps using 1883; the
web app uses the WebSocket port. Same broker, same credentials, same topics.

## 2. Add a WebSocket listener to Mosquitto

Edit `/etc/mosquitto/mosquitto.conf` (or a file in `/etc/mosquitto/conf.d/`):

```conf
# Existing TCP listener — keep for the ESP32 device
listener 1883
protocol mqtt

# New WebSocket listener — for the web app / PWA
listener 9001
protocol websockets
```

Restart the broker:

```bash
sudo systemctl restart mosquitto
```

Open port 9001 in your firewall / security group.

### Production: use TLS (wss://)

An installed PWA is served over HTTPS, and a secure page **cannot** connect to
an insecure `ws://` socket — it must be `wss://`. Put the WebSocket listener
behind TLS. Easiest is to terminate TLS in nginx and proxy to Mosquitto:

```nginx
# /etc/nginx/sites-enabled/mqtt-ws
server {
    listen 443 ssl;
    server_name aerva.zeptac.com;

    ssl_certificate     /etc/letsencrypt/live/aerva.zeptac.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aerva.zeptac.com/privkey.pem;

    location /mqtt {
        proxy_pass http://127.0.0.1:9001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

Then the app connects to: `wss://aerva.zeptac.com:443/mqtt`

## 3. Configure the app

Open the app → **Settings → Connection**, and fill in:

| Field                | Value                                   |
| -------------------- | --------------------------------------- |
| Broker WebSocket URL | `wss://aerva.zeptac.com:443/mqtt`       |
| Username             | `aerva_zeptac`                          |
| Password             | `IOTaqi@456`                            |
| Device MAC / Client ID | `EC64C96EDA3C`                        |
| Subscribe topic      | `AGM/pub/{MAC}`                         |
| Publish topic        | `{MAC}/publish`                        |
| Will topic           | `{MAC}/will`                           |

`{MAC}` is automatically replaced with the MAC you entered, so the subscribe
topic resolves to `AGM/pub/EC64C96EDA3C`.

Press **Connect**. The status banner turns green ("Connected — receiving live
data") and the dashboard pills switch from **DEMO DATA** to **LIVE**. The
settings are saved in the browser, so the app reconnects automatically next time.

## 4. Expected payload

The app parses this exact JSON shape (matching your device):

```json
{
  "MAC": "EC64C96EDA3C",
  "TIME_STATUS": "OK",
  "TIME": "2026-04-20 14:59:04",
  "env": { "temp": 28.3, "hum": 54 },
  "gas": { "co_ppm": 0.1, "o2_pct": 19.6, "co2_ppm": 2866 },
  "pm":  { "pm1_0": 13, "pm2_5": 16, "pm10": 18 },
  "diag": { "rssi": 5, "o2_warn": false, "uptime": 101, "mqtt_err": 0 }
}
```

It maps to: Temperature, Humidity, CO, O₂, CO₂, PM1/PM2.5/PM10, and derives a
CPCB AQI from PM2.5. Diagnostics (RSSI, uptime) appear on the connection page.

## 5. Demo mode

If no broker is configured (or it's unreachable), the app shows realistic demo
data so the UI is always reviewable. The pill reads **DEMO DATA** so it's never
mistaken for live readings.

## Troubleshooting

- **Stuck on "CONNECTING"** → the WebSocket URL is wrong or the port is closed.
  Confirm the listener is up: `sudo netstat -tlnp | grep 9001`.
- **Connects then immediately drops** → usually bad credentials. Check the
  username/password and that the broker allows that user to subscribe to the topic.
- **"OFFLINE" on an HTTPS site** → you're using `ws://` on an HTTPS page. Switch
  to `wss://` (see step 2, TLS).
- **Connected but no data** → the subscribe topic doesn't match what the device
  publishes. Confirm the device is publishing to `AGM/pub/EC64C96EDA3C`.
