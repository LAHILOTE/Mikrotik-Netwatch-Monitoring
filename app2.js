const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const hostname = '36.93.13.132'; // Use your VPS public IP
const port = 3001;

// Basic Express route
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// Create an HTTP server with Express
const server = http.createServer(app);

// Create a WebSocket server that piggybacks on the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected.');

    // Send an initial message to the WebSocket client
    ws.send('Connected to WebSocket server!');

    // Echo any received messages back to the client
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        ws.send(`Echo: ${message}`);
    });
});

// Start the HTTP server
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
