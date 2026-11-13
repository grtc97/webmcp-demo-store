import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { DEFAULT_FILTERS, filtersForCategory, filtersForQuery } from './filters.js'
import { formatMoney, pluralize, unsplashUrl } from './format.js'

describe('format helpers', () => {
    it('formats rupees with Indian digit grouping', () => {
        assert.equal(formatMoney(1234567), '₹12,34,567')
        assert.equal(formatMoney('999'), '₹999')
    })

    it('pluralizes by count', () => {
        assert.equal(pluralize(1, 'item'), '1 item')
        assert.equal(pluralize(0, 'item'), '0 items')
        assert.equal(pluralize(3, 'product'), '3 products')
    })

    it('builds Unsplash photo urls', () => {
        assert.equal(unsplashUrl('abc'), 'https://images.unsplash.com/photo-abc')
    })
})

describe('filter helpers', () => {
    it('builds filters from the defaults without mutating them', () => {
        assert.equal(filtersForCategory('Reading').category, 'Reading')
        assert.equal(filtersForQuery('tea').query, 'tea')
        assert.equal(DEFAULT_FILTERS.category, '')
        assert.equal(DEFAULT_FILTERS.query, '')
    })
})
