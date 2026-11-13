export const DEFAULT_FILTERS = { query: '', category: '', status: '', min_price: '', max_price: '', sort: 'relevance' }

export function filtersForCategory(category) {
    return { ...DEFAULT_FILTERS, category }
}

export function filtersForQuery(query) {
    return { ...DEFAULT_FILTERS, query }
}
