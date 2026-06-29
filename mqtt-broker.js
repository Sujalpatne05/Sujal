const aedes = require('aedes')();
const { createServer } = require('net');
const { createServer: createHttpServer } = require('http');
const WebSocketServer = require('ws').Server;

// TCP Server (Port 1883) - for ESP32 devices
const tcpServer = createServer(aedes.handle);
tcpServer.listen(1883, () => {
  console.log('MQTT TCP broker listening on port 1883');
});

// WebSocket Server (Port 9001) - for web apps
const httpServer = createHttpServer();
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  const duplex = require('stream').Duplex.from([
    ws,
    ws,
  ]);
  aedes.handle(duplex);
});

httpServer.listen(9001, () => {
  console.log('MQTT WebSocket broker listening on ws://localhost:9001');
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
