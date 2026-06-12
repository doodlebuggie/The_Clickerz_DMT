import { api } from '../api';
import { escapeHtml } from '../escape';
function formatAmount(tx) {
    const val = tx.debitAmount ?? tx.receiveAmount ?? '0';
    const scale = tx.assetScale ?? 2;
    const amount = (Number(val) / Math.pow(10, scale)).toFixed(scale);
    return `${amount} ${tx.assetCode}`;
}
function formatDate(ts) {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function formatPointer(url) {
    if (url.startsWith('$'))
        return url;
    return url.replace(/^https?:\/\//, '$');
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
export async function renderHistoryView(container) {
    container.innerHTML = `<div class="card"><p class="muted">Loading history…</p></div>`;
    let history;
    try {
        history = await api.history();
    }
    catch {
        container.innerHTML = `<div class="card"><p class="error-msg">Failed to load transaction history.</p></div>`;
        return;
    }
    const tableHtml = history.length === 0
        ? `<div class="card">
         <p class="muted history-empty">
           No transactions yet.
           <a href="#/remit" class="history-empty-link">Send your first payment →</a>
         </p>
       </div>`
        : `<div class="card history-card">
         <div class="history-table-wrap">
           <table class="history-table">
             <colgroup>
               <col class="col-date" />
               <col class="col-amount" />
               <col class="col-recip" />
               <col class="col-status" />
             </colgroup>
             <thead>
               <tr>
                 <th>Date</th>
                 <th>Amount</th>
                 <th>Recipient</th>
                 <th>Status</th>
               </tr>
             </thead>
             <tbody>
               ${history.map(tx => `
                 <tr>
                   <td class="history-date-cell">${formatDate(tx.createdAt)}</td>
                   <td class="history-amount-cell">${formatAmount(tx)}</td>
                   <td>
                     ${tx.recipientId
            ? `<a class="history-recip-link" href="#/user/${encodeURIComponent(tx.recipientId)}">
                            <div class="history-recip-name">${escapeHtml(tx.recipientName ?? '—')}</div>
                            <div class="history-recip-pointer">${escapeHtml(formatPointer(tx.receiverWalletAddress))}</div>
                          </a>`
            : `<div>
                            <div class="history-recip-name">${escapeHtml(tx.recipientName ?? '—')}</div>
                            <div class="history-recip-pointer">${escapeHtml(formatPointer(tx.receiverWalletAddress))}</div>
                          </div>`}
                   </td>
                   <td>
                     <span class="status-badge status-${tx.status.toLowerCase()}">${formatStatus(tx.status)}</span>
                   </td>
                 </tr>
               `).join('')}
             </tbody>
           </table>
         </div>
       </div>`;
    container.innerHTML = `
    <div class="history-page">
      <div class="history-page-header">
        <h2 class="history-page-title">Transaction history</h2>
        <p class="history-page-sub">Your sent payments, most recent first.</p>
      </div>
      ${tableHtml}
    </div>
  `;
}
