import { getToken } from './auth';
const BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';
// ─── HTTP helpers ─────────────────────────────────────────────────────────────
async function post(path, body, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = getToken();
        if (token)
            headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}
async function get(path, auth = false) {
    const headers = {};
    if (auth) {
        const token = getToken();
        if (token)
            headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE}${path}`, { headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}
async function patch(path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token)
        headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}
// ─── API client ───────────────────────────────────────────────────────────────
export const api = {
    auth: {
        signup: (body) => post('/api/auth/signup', body),
        login: (body) => post('/api/auth/login', body),
        me: () => get('/api/auth/me', true),
        update: (body) => patch('/api/auth/me', body),
    },
    users: {
        search: (q) => get(`/api/users/search?q=${encodeURIComponent(q)}`, true),
        getProfile: (id) => get(`/api/users/${encodeURIComponent(id)}`, true),
    },
    walletInfo: (url) => get(`/api/remit/wallet-info?url=${encodeURIComponent(url)}`, true),
    quote: (body) => post('/api/remit/quote', body, true),
    consent: (transactionId) => post('/api/remit/consent', { transactionId }, true),
    status: (id) => get(`/api/remit/status/${id}`),
    history: () => get('/api/remit/history', true),
};
