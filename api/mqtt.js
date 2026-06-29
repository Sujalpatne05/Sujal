const aedes = require('aedes')();
const WebSocketServer = require('ws').Server;
const http = require('http');

let server;
let wss;

export default function handler(req, res) {
  if (!server) {
    server = http.createServer();
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
      const duplex = require('stream').Duplex.from([ws, ws]);
      aedes.handle(duplex);
    });

    aedes.on('client:connected', (client) => {
      console.log(`Client connected: ${client.id}`);
    });

    aedes.on('publish:start', (packet) => {
      if (packet.topic.includes('AGM')) {
        console.log(`Message on ${packet.topic}`);
      }
    });
  }

  if (req.method === 'GET') {
    res.status(200).json({ status: 'ok', broker: 'running' });
  } else {
    res.status(405).end('Method not allowed');
  }
}
