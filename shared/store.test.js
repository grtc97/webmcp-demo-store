import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import { DEFAULT_SEARCH_LIMIT, LOW_STOCK_AT, MAX_SEARCH_LIMIT, createStore } from './store.js'

const CUSTOMER = {
    name: 'Asha Rao',
    email: 'asha@example.com',
    phone: '9999999999',
    address: '1 Test Street',
    city: 'Pune',
    postal_code: '411001',
}

function createMemoryStorage() {
    const memory = new Map()
    return { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) }
}

describe('store', () => {
    let store

    beforeEach(() => {
        store = createStore(createMemoryStorage())
    })

    describe('search', () => {
        it('returns every product when no filter is given', () => {
            assert.equal(store.search().length, 29)
        })

        it('matches every query word case-insensitively', () => {
            const names = store.search({ query: 'WIRELESS headphones' }).map((product) => product.name)
            assert.deepEqual(names, ['Wireless ANC Over-Ear Headphones'])
        })

        it('finds products through FAQ text, not just the name', () => {
            const names = store.search({ query: 'swimming' }).map((product) => product.name)
            assert.ok(names.includes('Pulse 3 Smartwatch with AMOLED Screen'))
        })

        it('filters by category ignoring case', () => {
            const products = store.search({ category: 'apparel' })
            assert.ok(products.length > 0)
            assert.ok(products.every((product) => product.category === 'Apparel'))
        })

        it('sorts by price in both directions', () => {
            const ascending = store.search({ sort: 'price_asc' }).map((product) => product.price_from)
            const descending = store.search({ sort: 'price_desc' }).map((product) => product.price_from)
            assert.deepEqual(
                ascending,
                [...ascending].sort((a, b) => a - b),
            )
            assert.deepEqual(
                descending,
                [...descending].sort((a, b) => b - a),
            )
        })

        it('lists the Office & Stationery category with its products', () => {
            assert.ok(store.categories().includes('Office & Stationery'))
            const names = store.search({ category: 'office & stationery' }).map((product) => product.name)
            assert.deepEqual(names, ['Hardcover Ruled Notebook A5', 'Gel Pen Set 12 Colours', 'Wooden Pen and Pencil Holder'])
        })

        it('returns nothing for a query that matches no product', () => {
            assert.deepEqual(store.search({ query: 'zzzz-no-such-thing' }), [])
        })
    })

    describe('searchPage', () => {
        it('returns the first 10 products by default with paging info', () => {
            const page = store.searchPage()
            assert.equal(DEFAULT_SEARCH_LIMIT, 10)
            assert.equal(page.products.length, 10)
            assert.deepEqual([page.total, page.offset, page.limit, page.has_more], [29, 0, 10, true])
        })

        it('walks through every product exactly once with offset', () => {
            const ids = []
            let offset = 0
            for (let guard = 0; guard < 10; guard++) {
                const page = store.searchPage({ offset })
                ids.push(...page.products.map((product) => product.id))
                if (!page.has_more) {
                    break
                }
                offset += page.limit
            }
            assert.deepEqual(
                ids,
                store.search().map((product) => product.id),
            )
        })

        it('reports has_more false on the last page and an empty page past the end', () => {
            assert.equal(store.searchPage({ offset: 20 }).has_more, false)
            assert.equal(store.searchPage({ offset: 20 }).products.length, 9)
            const beyond = store.searchPage({ offset: 100 })
            assert.deepEqual([beyond.products.length, beyond.total, beyond.has_more], [0, 29, false])
        })

        it('applies filters before paging', () => {
            const page = store.searchPage({ category: 'Apparel', limit: 2 })
            assert.equal(page.total, 5)
            assert.equal(page.products.length, 2)
            assert.equal(page.has_more, true)
        })

        it('accepts the maximum limit and rejects values outside the range', () => {
            assert.equal(MAX_SEARCH_LIMIT, 50)
            assert.equal(store.searchPage({ limit: 50 }).products.length, 29)
            assert.throws(() => store.searchPage({ limit: 0 }), /limit must be between 1 and 50/)
            assert.throws(() => store.searchPage({ limit: 51 }), /limit must be between 1 and 50/)
            assert.throws(() => store.searchPage({ offset: -1 }), /offset must be 0 or more/)
            assert.throws(() => store.searchPage({ limit: 'many' }), /limit must be an integer/)
        })

        it('treats empty strings from forms as not set', () => {
            const page = store.searchPage({ limit: '', offset: '', query: '' })
            assert.deepEqual([page.limit, page.offset], [10, 0])
        })
    })

    describe('stock status', () => {
        it('derives status from quantity using LOW_STOCK_AT', () => {
            assert.equal(LOW_STOCK_AT, 5)
            const variants = store.getProduct(1).variants
            assert.equal(variants[0].status, 'out_of_stock')
            assert.equal(variants[2].quantity, 4)
            assert.equal(variants[2].status, 'low_stock')
            assert.equal(store.getProduct(2).variants[0].status, 'in_stock')
        })
    })

    describe('seed data', () => {
        it('has 29 products with sequential ids and unique SKUs', () => {
            const products = store.search()
            assert.deepEqual(
                products.map((product) => product.id),
                Array.from({ length: 29 }, (_, index) => index + 1),
            )
            const variants = products.flatMap((product) => product.variants)
            assert.equal(new Set(variants.map((variant) => variant.sku)).size, variants.length)
            assert.deepEqual(
                variants.map((variant) => variant.id),
                Array.from({ length: variants.length }, (_, index) => index + 1),
            )
        })

        it('gives both demo smartwatches the same price and stock', () => {
            const [pulse, ultra] = [store.getProduct(28), store.getProduct(29)]
            assert.deepEqual(
                pulse.variants.map(({ price, quantity }) => [price, quantity]),
                ultra.variants.map(({ price, quantity }) => [price, quantity]),
            )
        })
    })

    describe('lookups', () => {
        it('throws a readable error for unknown ids', () => {
            assert.throws(() => store.getProduct(999), /Product 999 not found/)
            assert.throws(() => store.getVariant(9999), /Variant 9999 not found/)
        })

        it('rejects ids that are not integers', () => {
            assert.throws(() => store.getProduct('abc'), /product_id must be an integer/)
        })
    })

    describe('wishlist', () => {
        it('adds a variant once and removes it again', () => {
            store.addToWishlist(3)
            const { wishlist_size } = store.addToWishlist(3)
            assert.equal(wishlist_size, 1)
            assert.equal(store.getWishlist()[0].wishlisted, true)
            assert.equal(store.removeFromWishlist(3).wishlist_size, 0)
        })
    })

    describe('cart', () => {
        it('adds, updates and removes lines and keeps totals right', () => {
            store.addToCart(4, 2)
            store.setCartQuantity(4, 3)
            const cart = store.getCart()
            assert.equal(cart.item_count, 3)
            assert.equal(cart.total, cart.items[0].price * 3)
            assert.equal(store.setCartQuantity(4, 0).items.length, 0)
        })

        it('refuses out-of-stock variants and quantities above stock', () => {
            assert.throws(() => store.addToCart(1, 1), /out of stock/)
            assert.throws(() => store.addToCart(3, 5), /Only 4 units/)
            store.addToCart(3, 4)
            assert.throws(() => store.addToCart(3, 1), /Only 4 units/)
        })

        it('rejects quantities outside 1-1000', () => {
            assert.throws(() => store.addToCart(4, 0), /between 1 and 1000/)
            assert.throws(() => store.addToCart(4, 1001), /between 1 and 1000/)
        })
    })

    describe('placeOrder', () => {
        it('creates an order, reduces stock and empties the cart', () => {
            const stockBefore = store.getVariant(4).quantity
            store.addToCart(4, 2)
            const order = store.placeOrder(CUSTOMER)
            assert.match(order.id, /^ORD-[A-Z0-9]{6}$/)
            assert.equal(order.items.length, 1)
            assert.equal(store.getVariant(4).quantity, stockBefore - 2)
            assert.equal(store.getCart().items.length, 0)
            assert.equal(store.getOrders()[0].id, order.id)
        })

        it('lists missing customer details', () => {
            store.addToCart(4, 1)
            assert.throws(
                () => store.placeOrder({ name: 'Only a name' }),
                /Missing required details: email, phone, address, city, postal_code/,
            )
        })

        it('rejects bad email, bad phone and an empty cart', () => {
            assert.throws(() => store.placeOrder(CUSTOMER), /Cart is empty/)
            store.addToCart(4, 1)
            assert.throws(() => store.placeOrder({ ...CUSTOMER, email: 'bad' }), /email looks invalid/)
            assert.throws(() => store.placeOrder({ ...CUSTOMER, phone: '12' }), /phone looks invalid/)
        })
    })

    describe('persistence', () => {
        it('shares state between stores on the same storage and notifies listeners', () => {
            const storage = createMemoryStorage()
            const first = createStore(storage)
            const second = createStore(storage)
            let notifications = 0
            first.subscribe(() => notifications++)
            first.addToCart(4, 1)
            assert.equal(second.getCart().item_count, 1)
            assert.equal(notifications, 1)
        })

        it('reset restores the seed data', () => {
            store.addToCart(4, 1)
            store.reset()
            assert.equal(store.getCart().items.length, 0)
        })

        it('falls back to a fresh shop when storage is corrupt or throws', () => {
            const corrupt = createStore({ getItem: () => '{not json', setItem: () => {} })
            assert.equal(corrupt.search().length, 29)
            const blocked = createStore({
                getItem: () => {
                    throw new Error('blocked')
                },
                setItem: () => {
                    throw new Error('quota')
                },
            })
            assert.doesNotThrow(() => blocked.addToCart(4, 1))
        })
    })
})
