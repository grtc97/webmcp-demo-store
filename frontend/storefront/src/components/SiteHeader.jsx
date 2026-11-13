import { Heart, Package, Search, ShoppingCart } from 'lucide-react'

function CountBubble({ count }) {
    return count > 0 ? <b>{count}</b> : null
}

export function SiteHeader({ theme, search, onSearchChange, onSearchSubmit, onBrandClick, wishlistCount, cartCount }) {
    return (
        <header className="top">
            <a className="brand" href="#/" onClick={onBrandClick}>
                ShopChrem<i>.</i>
                {theme.label && <small>{theme.label}</small>}
            </a>
            <form className="searchbar" role="search" onSubmit={onSearchSubmit}>
                <input
                    type="search"
                    placeholder="Search headphones, shoes, kettle, books…"
                    aria-label="Search products"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
                <button type="submit" aria-label="Search">
                    <Search size={18} />
                </button>
            </form>
            <nav className="icons" aria-label="Account">
                <a href="#/orders">
                    <Package size={19} />
                    <span>Orders</span>
                </a>
                <a href="#/wishlist">
                    <Heart size={19} />
                    <span>Wishlist</span>
                    <CountBubble count={wishlistCount} />
                </a>
                <a href="#/cart">
                    <ShoppingCart size={19} />
                    <span>Cart</span>
                    <CountBubble count={cartCount} />
                </a>
            </nav>
        </header>
    )
}
