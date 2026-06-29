const aedes = require('aedes')();
const { createServer } = require('net');
const { createServer: createHttpServer } = require('http');
const WebSocketServer = require('ws').Server;

const PORT = process.env.PORT || 10000;
const WS_PORT = process.env.WS_PORT || PORT;
const NODE_ENV = process.env.NODE_ENV || 'development';

// TCP Server (Port 1883 in dev, WS_PORT in prod) - for ESP32 devices
const tcpServer = createServer(aedes.handle);
tcpServer.listen(NODE_ENV === 'production' ? WS_PORT : 1883, () => {
  console.log(`MQTT TCP broker listening on port ${NODE_ENV === 'production' ? WS_PORT : 1883}`);
});

// WebSocket Server - for web apps
const httpServer = createHttpServer();
const wss = new WebSocketServer({ 
  server: httpServer,
  perMessageDeflate: false
});

wss.on('connection', (ws) => {
  const duplex = require('stream').Duplex.from([
    ws,
    ws,
  ]);
  aedes.handle(duplex);
});

httpServer.listen(WS_PORT, () => {
  console.log(`MQTT WebSocket broker listening on ws://0.0.0.0:${WS_PORT}`);
});
});

// Aedes events
aedes.on('client:connected', (client) => {
  console.log(`Client connected: ${client.id}`);
});

aedes.on('client:disconnected', (client) => {
  console.log(`Client disconnected: ${client.id}`);
});

aedes.on('publish:start', (packet) => {
  if (packet.topic.includes('AGM') || packet.topic.includes('publish')) {
    console.log(`Message on ${packet.topic}: ${packet.payload.toString().slice(0, 100)}`);
  }
});

process.on('SIGINT', () => {
  aedes.close(() => {
    tcpServer.close();
    httpServer.close();
    console.log('Broker stopped');
    process.exit(0);
  });
});

console.log('\n=== AERVA MQTT Broker Running ===');
console.log('TCP (ESP32):    mqtt://localhost:1883');
console.log('WebSocket:      ws://localhost:9001');
console.log('Default user:   aerva_zeptac');
console.log('==================================\n');
