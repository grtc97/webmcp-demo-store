const PRICE_KEYS = ['min_price', 'max_price']

// Only the filters the user actually set are sent to the tool.
export function buildSearchArgs(filters) {
    const args = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '' && !(key === 'sort' && value === 'relevance')),
    )
    for (const key of PRICE_KEYS) {
        if (key in args) {
            args[key] = Number(args[key])
        }
    }
    return args
}

// Arguments for the previous or next page of the same search. Returns null when there is no such page.
export function buildPageArgs(filters, page, direction) {
    const offset = page.offset + direction * page.limit
    if (offset < 0 || offset >= page.total) {
        return null
    }
    return { ...buildSearchArgs(filters), offset, limit: page.limit }
}
