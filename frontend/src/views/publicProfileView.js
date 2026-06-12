import { api } from '../api';
import { escapeHtml } from '../escape';
function initials(name) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('');
}
function direction(tx, otherWallet) {
    return tx.receiverWalletAddress === otherWallet ? 'sent' : 'received';
}
function formatAmount(tx, dir) {
    const val = dir === 'sent' ? (tx.debitAmount ?? tx.receiveAmount ?? '0')
        : (tx.receiveAmount ?? tx.debitAmount ?? '0');
    const scale = tx.assetScale ?? 2;
    const amount = (Number(val) / Math.pow(10, scale)).toFixed(scale);
    return `${amount} ${tx.assetCode}`;
}
function formatDate(ts) {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatStatus(status) {
    const labels = {
        COMPLETED: 'Completed',
        FAILED: 'Failed',
        PENDING: 'Pending',
        AWAITING_GRANT: 'Awaiting',
    };
    return labels[status] ?? status;
}
function formatPointer(url) {
    if (url.startsWith('$'))
        return url;
    return url.replace(/^https?:\/\//, '$');
}
export async function renderPublicProfileView(container, userId) {
    container.innerHTML = `<div class="card"><p class="muted">Loading profile…</p></div>`;
    let data;
    try {
        data = await api.users.getProfile(userId);
    }
    catch {
        container.innerHTML = `<div class="card"><p class="error-msg">User not found.</p></div>`;
        return;
    }
    const { user, sharedTransactions } = data;
    const safeName = escapeHtml(user.displayName);
    const avatarEl = user.avatar
        ? `<img class="pub-profile-avatar" src="${escapeHtml(user.avatar)}" alt="${safeName}" />`
        : `<div class="pub-profile-avatar pub-profile-avatar-placeholder">${escapeHtml(initials(user.displayName))}</div>`;
    const walletDisplay = user.walletAddress ? escapeHtml(formatPointer(user.walletAddress)) : 'No wallet set';
    const txRows = sharedTransactions.map(tx => {
        const dir = direction(tx, user.walletAddress ?? '');
        const dirLabel = dir === 'sent'
            ? `<span class="dir-badge dir-sent">You &#8594; ${safeName}</span>`
            : `<span class="dir-badge dir-received">${safeName} &#8594; You</span>`;
        return `
      <tr>
        <td class="history-date-cell">${formatDate(tx.createdAt)}</td>
        <td>${dirLabel}</td>
        <td class="history-amount-cell">${formatAmount(tx, dir)}</td>
        <td><span class="status-badge status-${tx.status.toLowerCase()}">${formatStatus(tx.status)}</span></td>
      </tr>
    `;
    }).join('');
    const txSection = sharedTransactions.length === 0
        ? `<p class="muted" style="padding: 0.5rem 0;">No shared transactions yet.</p>`
        : `<div class="history-table-wrap">
        <table class="history-table">
          <thead>
            <tr><th>Date</th><th>Direction</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>${txRows}</tbody>
        </table>
      </div>`;
    const sendBtn = user.walletAddress
        ? `<a href="#/remit" class="btn btn-africa-primary" style="width:100%;">Send Money →</a>`
        : '';
    container.innerHTML = `
    <div class="pub-profile-page">
      <div class="card history-card pub-profile-card">
        <button class="btn btn-secondary pub-profile-back" id="pub-back-btn" style="align-self:flex-start;font-size:0.8125rem;padding:0.35rem 0.75rem;">← Back</button>
        <div class="pub-profile-header">
          ${avatarEl}
          <div class="pub-profile-info">
            <h2 class="pub-profile-name">${safeName}</h2>
            <p class="muted" style="font-size:0.8125rem;word-break:break-all;">${walletDisplay}</p>
          </div>
        </div>
        ${sendBtn}
      </div>
      <div class="card history-card">
        <h3 class="pub-profile-tx-title">Shared transactions</h3>
        ${txSection}
      </div>
    </div>
  `;
    container.querySelector('#pub-back-btn').addEventListener('click', () => history.back());
}
