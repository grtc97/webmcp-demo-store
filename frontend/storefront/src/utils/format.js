// Formatting helpers and labels shared by the website and the MCP App.
export const STOCK_STATUS_LABELS = { in_stock: 'In stock', low_stock: 'Low stock', out_of_stock: 'Out of stock' }
export const STOCK_STATUS_TONES = { in_stock: 'good', low_stock: 'warn', out_of_stock: 'bad' }

export function formatMoney(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN')
}

export function pluralize(count, word) {
    return `${count} ${word}${count === 1 ? '' : 's'}`
}

export function unsplashUrl(photoId) {
    return `https://images.unsplash.com/photo-${photoId}`
}
