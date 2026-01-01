const API_URL = 'http://localhost:4000';

export async function getStatus() {
    const res = await fetch(`${API_URL}/status`);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
}

export async function startServer() {
    const res = await fetch(`${API_URL}/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
}

export async function stopServer(force = false) {
    const res = await fetch(`${API_URL}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
}
