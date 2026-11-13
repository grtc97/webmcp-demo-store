// Tiny hash router: #/  #/product/3  #/cart  #/checkout  #/wishlist  #/orders  #/widgets
export function readHashPath() {
    return location.hash.replace(/^#/, '') || '/'
}

export function navigate(path) {
    location.hash = path
    window.scrollTo({ top: 0 })
}

// '/product/3?x=1' -> { path, page: 'product', id: 3, params }
export function parseRoute(path) {
    const [routePath, query = ''] = path.split('?')
    const [, page, id] = routePath.split('/')
    return {
        path,
        page: page || 'home',
        id: id ? Number(id) : null,
        params: new URLSearchParams(query),
    }
}
