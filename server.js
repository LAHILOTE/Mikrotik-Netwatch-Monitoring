const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const { RouterOSAPI } = require('node-routeros');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

// Use your public IP or '0.0.0.0' to allow external access.
// For example, if your server’s public IP is 36.93.xx.xxx, you might set HOSTNAME accordingly.
// Here, I'll leave your original value for demonstration:
const HOSTNAME = '192.168.4.246';
const PORT = 8017; // Adjusted for your setup

console.log('🚀 Starting server...');
const app = express();

// Configure Express to serve static assets and EJS views.
app.use(express.static('public'));
app.set('views', './views'); // Ensure that your EJS files (like index.ejs) are in the "views" folder
app.set('view engine', 'ejs');

// Express route to render the frontend.
// This route calls the MikroTik API and passes the data to index.ejs.
// If fetchMikrotikData returns a falsy value (null), we provide a default object.
app.get('/', async (req, res) => {
    console.log('🖥 Handling GET request to /');
    const data = (await fetchMikrotikData()) || {
        cpuUsage: '0',
        hotspotOnline: 0,
        pppOnline: 0,
        aps: []
    };
    console.log('📄 Rendering index.ejs with data:', data);
    res.render('index', { data });
});

// Create an HTTP server that will serve both Express and WebSocket connections.
const server = http.createServer(app);

// Set up WebSocket server that uses the same HTTP server.
const wss = new WebSocket.Server({ server });

wss.on('connection', async (ws) => {
    console.log('🌐 WebSocket client connected.');

    // Immediately fetch MikroTik data and send it to the client
    const data = await fetchMikrotikData();
    ws.send(JSON.stringify(data));

    // Echo events from the client.
    ws.on('message', (message) => {
        console.log(`📡 Received from client: ${message}`);
        ws.send(`Echo: ${message}`);
    });

    // Periodically fetch MikroTik data and send to the client every 15 seconds.
    const interval = setInterval(async () => {
        const data = await fetchMikrotikData();
        ws.send(JSON.stringify(data));
    }, 15000);

    ws.on('close', () => {
        console.log('🔴 Client disconnected.');
        clearInterval(interval);
    });
});

// Set up the MikroTik API connection.
const conn = new RouterOSAPI({
    host: process.env.MIKROTIK_HOST,
    port: process.env.MIKROTIK_PORT,
    user: process.env.MIKROTIK_USER,
    password: process.env.MIKROTIK_PASS,
    timeout: 20000,
});

let isConnected = false;

// Fetch data from MikroTik.
// This function retrieves CPU, hotspot, PPP, and AP information.
// If an error occurs, it returns a default object so that your view always gets a valid data structure.
async function fetchMikrotikData() {
    console.log('🔍 Fetching MikroTik data...');
    try {
        if (!isConnected) {
            await conn.connect();
            console.log('✅ Connected to MikroTik.');
            isConnected = true;
        }

        console.log('📊 Fetching CPU, hotspot, PPP, and AP data...');
        const cpuData = await conn.write('/system/resource/print');
        const hotspotData = await conn.write('/ip/hotspot/active/print');
        const pppActiveData = await conn.write('/ppp/active/print');
        const netwatchData = await conn.write('/tool/netwatch/print');

        console.log('🔄 CPU Usage Updated:', cpuData[0]?.['cpu-load']);

        return {
            cpuUsage: cpuData[0]?.['cpu-load'] || '0',
            hotspotOnline: hotspotData.length,
            pppOnline: pppActiveData.length,
            aps: netwatchData.map(nw => ({
                name: nw.comment || '–',
                ip: nw.host || '–',
                status: nw.status === 'up' ? 'ON' : 'OFF'
            }))
        };
    } catch (err) {
        console.error('❌ MikroTik API Error:', err.message);
        // Return a default object to prevent errors in the template.
        return { cpuUsage: '0', hotspotOnline: 0, pppOnline: 0, aps: [] };
    }
}

// Start the HTTP server.
server.listen(PORT, HOSTNAME, () => {
    console.log(`🚀 Server running at http://${HOSTNAME}:${PORT}/`);
});
