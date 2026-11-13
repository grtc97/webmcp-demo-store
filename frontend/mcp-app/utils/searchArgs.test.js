import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildPageArgs, buildSearchArgs } from './searchArgs.js'

const EMPTY = { query: '', category: '', status: '', min_price: '', max_price: '', sort: 'relevance' }

describe('search args', () => {
    it('drops empty filters and the default sort', () => {
        assert.deepEqual(buildSearchArgs(EMPTY), {})
        assert.deepEqual(buildSearchArgs({ ...EMPTY, query: 'tea', sort: 'name' }), { query: 'tea', sort: 'name' })
    })

    it('turns price fields into numbers', () => {
        assert.deepEqual(buildSearchArgs({ ...EMPTY, min_price: '100', max_price: '900' }), { min_price: 100, max_price: 900 })
    })

    it('builds next and previous page args that keep the filters', () => {
        const filters = { ...EMPTY, category: 'Apparel' }
        const page = { total: 29, offset: 10, limit: 10 }
        assert.deepEqual(buildPageArgs(filters, page, 1), { category: 'Apparel', offset: 20, limit: 10 })
        assert.deepEqual(buildPageArgs(filters, page, -1), { category: 'Apparel', offset: 0, limit: 10 })
    })

    it('returns null when there is no previous or next page', () => {
        assert.equal(buildPageArgs(EMPTY, { total: 29, offset: 0, limit: 10 }, -1), null)
        assert.equal(buildPageArgs(EMPTY, { total: 29, offset: 20, limit: 10 }, 1), null)
        assert.equal(buildPageArgs(EMPTY, { total: 0, offset: 0, limit: 10 }, 1), null)
    })
})
