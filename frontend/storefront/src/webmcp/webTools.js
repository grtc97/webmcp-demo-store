// Website tools: the shared commerce handlers plus page navigation, so people can
// watch the agent work. Whether navigation happens before or after the call is set here.
import { webToolDefinitions } from '@shared/tools/definitions.js'
import { createToolHandlers } from '@shared/tools/handlers.js'

function toSearchFilters(args) {
    return {
        query: args.query || '',
        category: args.category || '',
        status: args.status || '',
        min_price: args.min_price ?? '',
        max_price: args.max_price ?? '',
        sort: args.sort || 'relevance',
    }
}

export function createWebTools(store, showInUI) {
    const handlers = createToolHandlers(store)

    // Runs a handler, then shows the page that matches its result.
    function thenShow(handlerName, buildView) {
        return async (args) => {
            const result = await handlers[handlerName](args)
            showInUI(buildView(result, args))
            return result
        }
    }

    const runners = {
        search_products: async (args) => {
            showInUI({ view: 'shop', filters: toSearchFilters(args) })
            return handlers.search_products(args)
        },
        get_product: thenShow('get_product', (_, args) => ({ view: 'product', productId: args.product_id })),
        check_availability: thenShow('check_availability', (variant) => ({ view: 'product', productId: variant.product_id })),
        add_to_wishlist: thenShow('add_to_wishlist', () => ({ view: 'wishlist' })),
        remove_from_wishlist: async (args) => handlers.remove_from_wishlist(args),
        get_wishlist: async () => handlers.get_wishlist(),
        add_to_cart: thenShow('add_to_cart', () => ({ view: 'cart' })),
        set_cart_quantity: thenShow('set_cart_quantity', () => ({ view: 'cart' })),
        get_cart: async () => handlers.get_cart(),
        remove_from_cart: async (args) => handlers.remove_from_cart(args),
        place_order: thenShow('place_order', (order) => ({ view: 'orders', placed: order.id })),
        get_orders: async () => {
            showInUI({ view: 'orders' })
            return handlers.get_orders()
        },
    }

    return webToolDefinitions.map((definition) => ({ ...definition, run: runners[definition.name] }))
}
