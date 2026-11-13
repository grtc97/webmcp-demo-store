import { ToolButton } from './ToolButton'

export function StoreNav({ snapshot }) {
    const toneFor = (view) => (snapshot.view === view ? 'dark' : 'outline')

    return (
        <nav className="app-nav" aria-label="Store">
            <ToolButton tool="search_products" tone={toneFor('catalog')}>
                Products
            </ToolButton>
            <ToolButton tool="get_wishlist" tone={toneFor('wishlist')}>
                Wishlist ({snapshot.wishlist.length})
            </ToolButton>
            <ToolButton tool="get_cart" tone={toneFor('cart')}>
                Cart ({snapshot.cart.item_count})
            </ToolButton>
            <ToolButton tool="get_orders" tone={toneFor('orders')}>
                Orders
            </ToolButton>
        </nav>
    )
}
