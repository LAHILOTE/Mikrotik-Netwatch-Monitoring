const socket = new WebSocket('ws://192.168.4.246:8017');
const escapeHTML = str => str.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[c]));

socket.onmessage = (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch (error) {
        console.warn("Received non-JSON message:", event.data);
        return; // Exit if message cannot be parsed.
    }

    // If the message is a handshake (contains init flag), you can either ignore it,
    // or merge with default values. Here we opt to merge with defaults.
    const defaultData = {
        cpuUsage: 0,
        hotspotOnline: 0,
        pppOnline: 0,
        aps: []
    };

    // Merge server data with defaults
    data = { ...defaultData, ...data };

    // Ensure aps is an array (it might be missing in the handshake)
    const aps = Array.isArray(data.aps) ? data.aps : [];

    // Use fallback values if fields are missing.
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
          <td><span class="badge ${ap.status === 'ON' ? 'bg-success' : 'bg-danger'}">${ap.status}</span></td>
      </tr>`;
    });
};
