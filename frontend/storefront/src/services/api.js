// The storefront "API". Same shape as a REST client (async, JSON in, JSON out),
// but the data lives in a JSON document in localStorage, so there is no server.
// The React UI and the WebMCP tools both go through this one file.
import { createStore } from '@shared/store.js'

const STORAGE_PROBE_KEY = '__t'

// localStorage can be blocked (private mode, sandboxed iframe). Fall back to memory.
function createBrowserStorage() {
    try {
        localStorage.setItem(STORAGE_PROBE_KEY, '1')
        localStorage.removeItem(STORAGE_PROBE_KEY)
        return localStorage
    } catch {
        const memory = new Map()
        return {
            getItem: (key) => memory.get(key) ?? null,
            setItem: (key, value) => memory.set(key, value),
        }
    }
}

function resetFromUrlIfRequested() {
    // Handy for workshops: open the site with ?reset to start from the seed data.
    if (new URLSearchParams(location.search).has('reset')) {
        store.reset()
        history.replaceState(null, '', location.pathname + location.hash)
    }
}

function toAsync(operation) {
    return async (...args) => operation(...args)
}

export const store = createStore(createBrowserStorage())

resetFromUrlIfRequested()

// Another tab changed the data: re-render everything here too.
window.addEventListener('storage', () => store.notify())

export const api = {
    categories: toAsync(store.categories),
    searchProducts: toAsync(store.search),
    getProduct: toAsync(store.getProduct),
    getVariant: toAsync(store.getVariant),
    getWishlist: toAsync(store.getWishlist),
    addToWishlist: toAsync(store.addToWishlist),
    removeFromWishlist: toAsync(store.removeFromWishlist),
    getCart: toAsync(store.getCart),
    addToCart: toAsync(store.addToCart),
    setCartQuantity: toAsync(store.setCartQuantity),
    removeFromCart: toAsync(store.removeFromCart),
    placeOrder: toAsync(store.placeOrder),
    getOrders: toAsync(store.getOrders),
    reset: toAsync(store.reset),
}
