import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import { createActions, toolResult } from './actions.js'

const CUSTOMER = {
    name: 'Asha Rao',
    email: 'asha@example.com',
    phone: '9999999999',
    address: '1 Test Street',
    city: 'Pune',
    postal_code: '411001',
}

describe('MCP actions', () => {
    let actions

    beforeEach(() => {
        actions = createActions()
    })

    it('returns a snapshot with view, categories, cart and wishlist', async () => {
        const result = await toolResult(actions, 'search_products', { query: 'kettle' })
        assert.equal(result.isError, undefined)
        const snapshot = result.structuredContent
        assert.equal(snapshot.view, 'catalog')
        assert.equal(snapshot.products.length, 1)
        assert.equal(snapshot.categories.length, 9)
        assert.deepEqual(snapshot.wishlist, [])
    })

    it('returns an error result instead of throwing', async () => {
        const unknownTool = await toolResult(actions, 'nope')
        assert.equal(unknownTool.isError, true)
        assert.match(unknownTool.content[0].text, /Unknown tool: nope/)

        const missingProduct = await toolResult(actions, 'get_product', { product_id: 999 })
        assert.equal(missingProduct.isError, true)
    })

    it('does not let a tool name reach inherited object properties', async () => {
        const result = await toolResult(actions, 'constructor')
        assert.equal(result.isError, true)
    })

    it('refuses checkout with an empty cart', async () => {
        const result = await toolResult(actions, 'show_checkout')
        assert.equal(result.isError, true)
        assert.match(result.content[0].text, /Add a product to your cart/)
    })

    it('needs confirmed: true to place an order', async () => {
        await toolResult(actions, 'add_to_cart', { variant_id: 4, quantity: 1 })
        const unconfirmed = await toolResult(actions, 'place_order', { customer: CUSTOMER, confirmed: false })
        assert.equal(unconfirmed.isError, true)
        assert.equal((await toolResult(actions, 'get_cart')).structuredContent.cart.item_count, 1)
    })

    it('never returns customer details after an order', async () => {
        await toolResult(actions, 'add_to_cart', { variant_id: 4, quantity: 1 })
        const placed = await toolResult(actions, 'place_order', { customer: CUSTOMER, confirmed: true })
        assert.equal(placed.structuredContent.view, 'confirmation')
        assert.equal(placed.structuredContent.order.customer, undefined)

        const orders = (await toolResult(actions, 'get_orders')).structuredContent.orders
        assert.equal(orders.length, 1)
        assert.equal(orders[0].customer, undefined)
        assert.ok(!JSON.stringify(orders).includes(CUSTOMER.email))
    })

    it('keeps separate shops for separate action sets', async () => {
        const other = createActions()
        await toolResult(actions, 'add_to_cart', { variant_id: 4, quantity: 1 })
        assert.equal((await toolResult(other, 'get_cart')).structuredContent.cart.item_count, 0)
    })
})
