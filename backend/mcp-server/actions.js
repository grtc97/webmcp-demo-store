// MCP actions: run a shared handler, then return a snapshot the MCP App can render
// without making further calls.
import { createStore } from '../../shared/store.js'
import { createToolHandlers } from '../../shared/tools/handlers.js'

// In-memory storage: one demo shop per server process, nothing is persisted.
export function createDemoStore() {
    const memory = new Map()
    return createStore({
        getItem: (key) => memory.get(key) ?? null,
        setItem: (key, value) => memory.set(key, value),
    })
}

// Orders keep the customer's details, but they are never sent back to the chat.
function withoutCustomer({ customer, ...order }) {
    return order
}

export function createActions(store = createDemoStore()) {
    const handlers = createToolHandlers(store)

    async function createSnapshot(view, extra = {}) {
        const [cart, wishlist] = await Promise.all([handlers.get_cart(), handlers.get_wishlist()])
        return { view, categories: store.categories(), cart, wishlist, ...extra }
    }

    function createCartAction(handlerName) {
        return async (args) => {
            await handlers[handlerName](args)
            return createSnapshot('cart')
        }
    }

    function createWishlistAction(handlerName) {
        return async (args) => {
            await handlers[handlerName](args)
            return createSnapshot('wishlist')
        }
    }

    return {
        async search_products(args = {}) {
            const { products, ...page } = await handlers.search_products(args)
            const { query = '', category = '', status = '', min_price = '', max_price = '', sort = 'relevance' } = args
            return createSnapshot('catalog', { products, page, filters: { query, category, status, min_price, max_price, sort } })
        },

        async get_product(args) {
            return createSnapshot('product', { product: await handlers.get_product(args) })
        },

        async check_availability(args) {
            const variant = await handlers.check_availability(args)
            const product = await handlers.get_product({ product_id: variant.product_id })
            return createSnapshot('product', { product, variant })
        },

        get_cart: () => createSnapshot('cart'),
        add_to_cart: createCartAction('add_to_cart'),
        set_cart_quantity: createCartAction('set_cart_quantity'),
        remove_from_cart: createCartAction('remove_from_cart'),

        get_wishlist: () => createSnapshot('wishlist'),
        add_to_wishlist: createWishlistAction('add_to_wishlist'),
        remove_from_wishlist: createWishlistAction('remove_from_wishlist'),

        async show_checkout() {
            const cart = await handlers.get_cart()
            if (!cart.items.length) {
                throw new Error('Add a product to your cart before checkout.')
            }
            return createSnapshot('checkout')
        },

        async place_order({ customer, confirmed } = {}) {
            if (confirmed !== true) {
                throw new Error('Review the cart and confirm this demo order first.')
            }
            const order = await handlers.place_order(customer)
            return createSnapshot('confirmation', { order: withoutCustomer(order) })
        },

        async get_orders() {
            const orders = await handlers.get_orders()
            return createSnapshot('orders', { orders: orders.map(withoutCustomer) })
        },
    }
}

// Runs one action and wraps the outcome as an MCP tool result.
export async function toolResult(actions, name, args = {}) {
    try {
        if (!Object.hasOwn(actions, name)) {
            throw new Error(`Unknown tool: ${name}`)
        }
        const data = await actions[name](args)
        return { content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data }
    } catch (error) {
        return { isError: true, content: [{ type: 'text', text: error?.message ?? String(error) }] }
    }
}
