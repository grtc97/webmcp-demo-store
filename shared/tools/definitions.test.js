import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { z } from 'zod'

import { createMcpToolDefinitions, webToolDefinitions } from './definitions.js'

describe('tool definitions', () => {
    it('exposes 12 web tools and 13 MCP tools (show_checkout is MCP only)', () => {
        const webNames = webToolDefinitions.map((tool) => tool.name)
        const mcpNames = createMcpToolDefinitions(z).map((tool) => tool.name)
        assert.equal(webNames.length, 12)
        assert.equal(mcpNames.length, 13)
        assert.ok(mcpNames.includes('show_checkout'))
        assert.ok(!webNames.includes('show_checkout'))
    })

    it('gives every tool a description', () => {
        for (const tool of webToolDefinitions) {
            assert.ok(tool.description, `${tool.name} has no web description`)
        }
        for (const tool of createMcpToolDefinitions(z)) {
            assert.ok(tool.title && tool.description, `${tool.name} has no title or description`)
        }
    })

    it('has no tool that edits products, stock or the catalog', () => {
        const names = createMcpToolDefinitions(z).map((tool) => tool.name)
        assert.ok(names.every((name) => !/^(create|update|delete|edit|set_stock)/.test(name)))
    })

    it('requires explicit confirmation to place an MCP order', () => {
        const placeOrder = createMcpToolDefinitions(z).find((tool) => tool.name === 'place_order')
        const schema = z.object(placeOrder.inputSchema)
        const customer = { name: 'A', email: 'a@b.co', phone: '9999999', address: 'x', city: 'y', postal_code: '1' }
        assert.equal(schema.safeParse({ customer, confirmed: false }).success, false)
        assert.equal(schema.safeParse({ customer, confirmed: true }).success, true)
    })

    it('lets agents page through search results', () => {
        const search = createMcpToolDefinitions(z).find((tool) => tool.name === 'search_products')
        const schema = z.object(search.inputSchema)
        assert.equal(schema.safeParse({ limit: 50, offset: 10 }).success, true)
        assert.equal(schema.safeParse({ limit: 51 }).success, false)
        assert.equal(schema.safeParse({ limit: 0 }).success, false)
        assert.equal(schema.safeParse({ offset: -1 }).success, false)

        const webSearch = webToolDefinitions.find((tool) => tool.name === 'search_products')
        assert.ok(webSearch.properties.limit && webSearch.properties.offset)
        assert.match(webSearch.description, /has_more/)
    })
})
