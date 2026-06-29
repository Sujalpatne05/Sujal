const aedes = require('aedes')();
const { createServer } = require('net');
const { createServer: createHttpServer } = require('http');
const WebSocketServer = require('ws').Server;
const { Duplex } = require('stream');

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// WebSocket Server - for web apps
const httpServer = createHttpServer((req, res) => {
  // Health check endpoint
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', broker: 'running' }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const wss = new WebSocketServer({ 
  server: httpServer,
  perMessageDeflate: false
});

wss.on('connection', (ws) => {
  // Wrap WebSocket as a Duplex stream
  const duplex = new Duplex({
    read() {},
    write(chunk, encoding, callback) {
      ws.send(chunk, callback);
    }
  });

  ws.on('message', (chunk) => {
    duplex.push(chunk);
  });

  ws.on('close', () => {
    duplex.push(null);
  });

  ws.on('error', (err) => {
    duplex.destroy(err);
  });

  aedes.handle(duplex);
});

httpServer.listen(NODE_ENV === 'production' ? PORT : 9001, () => {
  console.log(`MQTT WebSocket broker listening on ws://0.0.0.0:${NODE_ENV === 'production' ? PORT : 9001}`);
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
    httpServer.close();
    console.log('Broker stopped');
    process.exit(0);
  });
});

console.log('\n=== AERVA MQTT Broker Running ===');
console.log(`WebSocket:      ws://localhost:${NODE_ENV === 'production' ? PORT : 9001}`);
console.log('Default user:   aerva_zeptac');
console.log('==================================\n');
