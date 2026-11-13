// Storefront business logic. Pure JavaScript: no React, no network.
// The whole shop is one JSON document, seeded from products.json and then kept in
// `storage` (localStorage in the browser, a Map on the MCP server). Every operation
// reads the fresh document, changes it and writes it back, so several tabs stay consistent.
import seedProducts from './products.json' with { type: 'json' }

const STORAGE_KEY = 'shopchrem:v2'
const MAX_CART_QUANTITY = 1000
const REQUIRED_CUSTOMER_FIELDS = ['name', 'email', 'phone', 'address', 'city', 'postal_code']

export const LOW_STOCK_AT = 5
export const DEFAULT_SEARCH_LIMIT = 10
export const MAX_SEARCH_LIMIT = 50

function deepClone(value) {
    return JSON.parse(JSON.stringify(value))
}

function toInteger(value, fieldName) {
    const number = Number(value)
    if (!Number.isInteger(number)) {
        throw new Error(`${fieldName} must be an integer`)
    }
    return number
}

function createOrderId() {
    return `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function getStockStatus(quantity) {
    if (quantity <= 0) {
        return 'out_of_stock'
    }
    return quantity <= LOW_STOCK_AT ? 'low_stock' : 'in_stock'
}

function getProductStatus(variants) {
    if (variants.some((variant) => variant.status === 'in_stock')) {
        return 'in_stock'
    }
    return variants.some((variant) => variant.status === 'low_stock') ? 'low_stock' : 'out_of_stock'
}

function getProductImages(product) {
    if (product.images?.length) {
        return product.images
    }
    return product.image ? [product.image] : []
}

function isBlank(value) {
    return value == null || value === ''
}

function buildSearchText(product) {
    const specsText = Object.entries(product.specs ?? {})
        .flat()
        .join(' ')
    const faqText = product.faq.map((entry) => `${entry.question} ${entry.answer}`).join(' ')
    const variantsText = product.variants.map((variant) => `${variant.label} ${variant.sku}`).join(' ')
    return `${product.name} ${product.category} ${product.description} ${specsText} ${faqText} ${variantsText}`.toLowerCase()
}

function createFreshState() {
    return {
        products: deepClone(seedProducts),
        wishlist: [], // variant ids
        cart: [], // { variant_id, quantity }
        orders: [],
    }
}

export function createStore(storage) {
    const listeners = new Set()

    function notify() {
        listeners.forEach((listener) => listener())
    }

    function subscribe(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
    }

    function loadState() {
        try {
            const rawState = storage.getItem(STORAGE_KEY)
            if (rawState) {
                return JSON.parse(rawState)
            }
        } catch {
            // Corrupt or blocked storage: fall through to a fresh shop.
        }
        return createFreshState()
    }

    function saveState(state) {
        try {
            storage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch {
            // Ignore quota errors; the in-memory result is still returned.
        }
        notify()
    }

    function findVariant(state, variantId) {
        const id = toInteger(variantId, 'variant_id')
        for (const product of state.products) {
            const variant = product.variants.find((candidate) => candidate.id === id)
            if (variant) {
                return { product, variant }
            }
        }
        throw new Error(`Variant ${id} not found`)
    }

    function toVariantView(state, variant) {
        return {
            id: variant.id,
            sku: variant.sku,
            label: variant.label,
            price: variant.price,
            quantity: variant.quantity,
            status: getStockStatus(variant.quantity),
            wishlisted: state.wishlist.includes(variant.id),
        }
    }

    function toVariantWithProductView(state, product, variant) {
        return {
            product_id: product.id,
            product_name: product.name,
            image: product.image || null,
            ...toVariantView(state, variant),
        }
    }

    function toProductView(state, product) {
        const variants = product.variants.map((variant) => toVariantView(state, variant))
        return {
            id: product.id,
            name: product.name,
            category: product.category,
            description: product.description,
            specs: product.specs,
            image: product.image || null,
            images: getProductImages(product),
            variants,
            faq: product.faq ?? [],
            price_from: Math.min(...variants.map((variant) => variant.price)),
            total_quantity: variants.reduce((sum, variant) => sum + variant.quantity, 0),
            status: getProductStatus(variants),
        }
    }

    function toCartView(state) {
        const items = state.cart.map((cartRow) => {
            const { product, variant } = findVariant(state, cartRow.variant_id)
            return {
                variant_id: variant.id,
                product_id: product.id,
                product_name: product.name,
                image: product.image || null,
                category: product.category,
                sku: variant.sku,
                label: variant.label,
                price: variant.price,
                quantity: cartRow.quantity,
                available: variant.quantity,
                subtotal: variant.price * cartRow.quantity,
            }
        })
        return {
            items,
            item_count: items.reduce((sum, item) => sum + item.quantity, 0),
            total: items.reduce((sum, item) => sum + item.subtotal, 0),
        }
    }

    // ---- Catalog ----

    function categories() {
        return [...new Set(loadState().products.map((product) => product.category))]
    }

    function search({ query = '', category = '', status = '', min_price, max_price, sort = 'relevance' } = {}) {
        const state = loadState()
        const queryTokens = String(query).toLowerCase().split(/\s+/).filter(Boolean)
        const categoryFilter = String(category).toLowerCase()

        const products = state.products
            .map((product) => toProductView(state, product))
            .filter((product) => {
                const searchText = buildSearchText(product)
                if (!queryTokens.every((token) => searchText.includes(token))) {
                    return false
                }
                if (category && product.category.toLowerCase() !== categoryFilter) {
                    return false
                }
                if (status && !product.variants.some((variant) => variant.status === status)) {
                    return false
                }
                if (!isBlank(min_price) && !product.variants.some((variant) => variant.price >= Number(min_price))) {
                    return false
                }
                if (!isBlank(max_price) && !product.variants.some((variant) => variant.price <= Number(max_price))) {
                    return false
                }
                return true
            })

        if (sort === 'price_asc') {
            products.sort((first, second) => first.price_from - second.price_from)
        } else if (sort === 'price_desc') {
            products.sort((first, second) => second.price_from - first.price_from)
        } else if (sort === 'name') {
            products.sort((first, second) => first.name.localeCompare(second.name))
        }
        return products
    }

    // Same filters as search(), plus paging. Used by the agent tools so one call stays small.
    function searchPage({ limit, offset, ...filters } = {}) {
        const pageLimit = isBlank(limit) ? DEFAULT_SEARCH_LIMIT : toInteger(limit, 'limit')
        const pageOffset = isBlank(offset) ? 0 : toInteger(offset, 'offset')
        if (pageLimit < 1 || pageLimit > MAX_SEARCH_LIMIT) {
            throw new Error(`limit must be between 1 and ${MAX_SEARCH_LIMIT}`)
        }
        if (pageOffset < 0) {
            throw new Error('offset must be 0 or more')
        }

        const matches = search(filters)
        const products = matches.slice(pageOffset, pageOffset + pageLimit)
        return {
            products,
            total: matches.length,
            offset: pageOffset,
            limit: pageLimit,
            has_more: pageOffset + products.length < matches.length,
        }
    }

    function getProduct(productId) {
        const state = loadState()
        const id = toInteger(productId, 'product_id')
        const product = state.products.find((candidate) => candidate.id === id)
        if (!product) {
            throw new Error(`Product ${id} not found`)
        }
        return toProductView(state, product)
    }

    function getVariant(variantId) {
        const state = loadState()
        const { product, variant } = findVariant(state, variantId)
        return toVariantWithProductView(state, product, variant)
    }

    // ---- Wishlist ----

    function getWishlist() {
        const state = loadState()
        return state.wishlist.map((variantId) => {
            const { product, variant } = findVariant(state, variantId)
            return toVariantWithProductView(state, product, variant)
        })
    }

    function addToWishlist(variantId) {
        const state = loadState()
        const { product, variant } = findVariant(state, variantId)
        if (!state.wishlist.includes(variant.id)) {
            state.wishlist.push(variant.id)
        }
        saveState(state)
        return {
            ok: true,
            message: `${product.name} (${variant.label}) is on the wishlist`,
            wishlist_size: state.wishlist.length,
        }
    }

    function removeFromWishlist(variantId) {
        const state = loadState()
        const id = toInteger(variantId, 'variant_id')
        state.wishlist = state.wishlist.filter((wishlistedId) => wishlistedId !== id)
        saveState(state)
        return { ok: true, wishlist_size: state.wishlist.length }
    }

    // ---- Cart ----

    function getCart() {
        return toCartView(loadState())
    }

    function addToCart(variantId, quantity = 1) {
        const state = loadState()
        const quantityToAdd = toInteger(quantity, 'quantity')
        if (quantityToAdd < 1 || quantityToAdd > MAX_CART_QUANTITY) {
            throw new Error(`quantity must be between 1 and ${MAX_CART_QUANTITY}`)
        }

        const { product, variant } = findVariant(state, variantId)
        const cartRow = state.cart.find((row) => row.variant_id === variant.id)
        const nextQuantity = (cartRow ? cartRow.quantity : 0) + quantityToAdd

        if (variant.quantity <= 0) {
            throw new Error(`${product.name} (${variant.label}) is out of stock.`)
        }
        if (nextQuantity > variant.quantity) {
            throw new Error(`Only ${variant.quantity} units of ${product.name} (${variant.label}) available`)
        }

        if (cartRow) {
            cartRow.quantity = nextQuantity
        } else {
            state.cart.push({ variant_id: variant.id, quantity: quantityToAdd })
        }
        saveState(state)
        return toCartView(state)
    }

    function setCartQuantity(variantId, quantity) {
        const state = loadState()
        const nextQuantity = toInteger(quantity, 'quantity')
        const { variant } = findVariant(state, variantId)

        if (nextQuantity <= 0) {
            state.cart = state.cart.filter((row) => row.variant_id !== variant.id)
        } else {
            if (nextQuantity > variant.quantity) {
                throw new Error(`Only ${variant.quantity} units available`)
            }
            const cartRow = state.cart.find((row) => row.variant_id === variant.id)
            if (cartRow) {
                cartRow.quantity = nextQuantity
            }
        }
        saveState(state)
        return toCartView(state)
    }

    function removeFromCart(variantId) {
        return setCartQuantity(variantId, 0)
    }

    // ---- Checkout ----

    function validateCustomer(customer) {
        const missingFields = REQUIRED_CUSTOMER_FIELDS.filter((field) => !String(customer[field] ?? '').trim())
        if (missingFields.length) {
            throw new Error(`Missing required details: ${missingFields.join(', ')}. Ask the customer for them.`)
        }
        if (!/^\S+@\S+\.\S+$/.test(customer.email)) {
            throw new Error('email looks invalid')
        }
        if (String(customer.phone).replace(/\D/g, '').length < 7) {
            throw new Error('phone looks invalid')
        }
    }

    function placeOrder(customer = {}) {
        const state = loadState()
        validateCustomer(customer)

        const cart = toCartView(state)
        if (!cart.items.length) {
            throw new Error('Cart is empty')
        }
        for (const item of cart.items) {
            if (item.quantity > item.available) {
                throw new Error(`Only ${item.available} units of ${item.product_name} (${item.label}) left`)
            }
        }
        for (const item of cart.items) {
            findVariant(state, item.variant_id).variant.quantity -= item.quantity
        }

        const order = {
            id: createOrderId(),
            status: 'placed',
            created_at: new Date().toISOString(),
            items: cart.items.map(({ available, ...item }) => item),
            total: cart.total,
            customer: Object.fromEntries(REQUIRED_CUSTOMER_FIELDS.map((field) => [field, String(customer[field]).trim()])),
        }
        state.orders.push(order)
        state.cart = []
        saveState(state)
        return order
    }

    function getOrders() {
        return loadState().orders.slice().reverse()
    }

    function reset() {
        saveState(createFreshState())
    }

    return {
        subscribe,
        notify,
        categories,
        search,
        searchPage,
        getProduct,
        getVariant,
        getWishlist,
        addToWishlist,
        removeFromWishlist,
        getCart,
        addToCart,
        setCartQuantity,
        removeFromCart,
        placeOrder,
        getOrders,
        reset,
    }
}
