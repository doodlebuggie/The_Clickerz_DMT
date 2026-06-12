// Views build their markup with template literals + innerHTML. Any value that a
// user can influence (display names, wallet addresses, avatars, error messages)
// must go through escapeHtml() before being interpolated, or one user's profile
// becomes a stored-XSS payload in another user's browser.
const REPLACEMENTS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
export function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (ch) => REPLACEMENTS[ch]);
}
