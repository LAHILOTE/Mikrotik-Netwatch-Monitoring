# MikroTik Monitoring Dashboard

A real-time monitoring dashboard for MikroTik devices built with Node.js, Express, WebSockets, and EJS. This application uses the MikroTik RouterOS API (via `node-routeros`) to fetch system resource data and display it on a dynamic web dashboard with live updates.

## Features

- **Real-time Data:**  
  Continuously polls your MikroTik device for system resources (CPU usage, hotspot sessions, PPP sessions, AP statuses) and pushes updates via WebSocket every 15 seconds.

- **Express & EJS:**  
  Serves a dynamic front-end dashboard rendered with EJS templates and static assets (HTML, CSS, and JavaScript).

- **WebSocket Integration:**  
  Immediately delivers data to connected clients and updates them in real-time as the state of the MikroTik device changes.

- **MikroTik RouterOS API:**  
  Connects to a MikroTik device using the `node-routeros` library, allowing seamless integration for network monitoring.

- **Easy Configuration:**  
  Environment variables (using `dotenv`) make it simple to configure your MikroTik connection settings without modifying the code directly.

## Tech Stack

- [Node.js](https://nodejs.org/) – JavaScript runtime environment.
- [Express](https://expressjs.com/) – Fast, minimalist web framework for Node.js.
- [ws](https://github.com/websockets/ws) – WebSocket implementation for Node.js.
- [EJS](https://ejs.co/) – Templating engine for generating dynamic HTML.
- [node-routeros](https://www.npmjs.com/package/node-routeros) – Library to interact with MikroTik RouterOS devices using their API.
- [dotenv](https://www.npmjs.com/package/dotenv) – Loads environment variables from a `.env` file.

## Installation

1. **Clone the Repository:**
2. Install Dependencies:
   npm install
3. Configure Environment Variables:
   MIKROTIK_HOST=your_mikrotik_ip
   MIKROTIK_PORT=8728         # Example: use the API port your device uses
   MIKROTIK_USER=your_username
   MIKROTIK_PASS=your_password

File Structure
.
├── public/                   # Static files (CSS, client-side JS, images, etc.)
│   ├── css/
│   ├── js/
│   │   └── socket.js         # Client-side WebSocket logic
│   └── images/
├── views/                    # EJS templates
│   └── index.ejs             # Main dashboard template
├── .env                      # Environment variables (should not be committed)
├── package.json              
├── server.js                 # Server code (Express, WebSocket, MikroTik integration)
└── README.md                 # This file

