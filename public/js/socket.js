const socket = new WebSocket('ws://192.168.4.246:8017');
const escapeHTML = str => str.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[c]));

// Get references to the UI elements for spinner, error notification, and timestamp.
const loadingSpinner = document.getElementById('loadingSpinner');
const lastUpdateEl = document.getElementById('lastUpdate');
const connectionErrorEl = document.getElementById('connectionError');

// Show spinner initially
loadingSpinner.style.display = 'block';

socket.onopen = () => {
    // Hide any previous error notifications when connection is established.
    connectionErrorEl.style.display = 'none';
};

socket.onmessage = (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch (error) {
        console.warn("Received non-JSON message:", event.data);
        return; // Exit if message cannot be parsed.
    }

    // Define default values so missing fields won't break the UI.
    const defaultData = {
        cpuUsage: 0,
        hotspotOnline: 0,
        pppOnline: 0,
        aps: []
    };

    // Merge the received data with the defaults.
    data = { ...defaultData, ...data };

    // Ensure data.aps is an array.
    const aps = Array.isArray(data.aps) ? data.aps : [];

    // Update metrics in the dashboard.
    document.getElementById('cpuUsage').innerText = data.cpuUsage + '%';
    document.getElementById('hotspotOnline').innerText = data.hotspotOnline;
    document.getElementById('pppOnline').innerText = data.pppOnline;

    const apOnCount = aps.filter(ap => ap.status === 'ON').length;
    const apOffCount = aps.filter(ap => ap.status === 'OFF').length;

    document.getElementById('apOn').innerText = apOnCount;
    document.getElementById('apOff').innerText = apOffCount;

    const apList = document.getElementById('apTableBody');
    apList.innerHTML = '';
    aps.forEach(ap => {
        const name = escapeHTML(ap.name);
        const ip = escapeHTML(ap.ip);
        apList.innerHTML += `
            <tr>
                <td>${name}</td>
                <td>${ip}</td>
                <td>
                    <span class="badge ${ap.status === 'ON' ? 'bg-success' : 'bg-danger'}">
                        ${ap.status}
                    </span>
                </td>
            </tr>`;
    });

    // Update the last update timestamp.
    const now = new Date().toLocaleTimeString();
    lastUpdateEl.innerText = `Last update: ${now}`;

    // Hide the spinner now that data has loaded.
    loadingSpinner.style.display = 'none';
};

socket.onerror = (error) => {
    console.error("WebSocket error observed:", error);
    connectionErrorEl.innerText = "Error with connection. Please check your network.";
    connectionErrorEl.style.display = 'block';
};

socket.onclose = () => {
    console.warn("WebSocket connection closed.");
    connectionErrorEl.innerText = "Connection lost. Reconnecting...";
    connectionErrorEl.style.display = 'block';
};
