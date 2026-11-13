import { EmptyState } from '../components/EmptyState'
import { StockBadge } from '../components/StockBadge'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { navigate } from '../services/router'
import { formatMoney } from '../utils/format'
import { ListRow } from '../widgets'

function WishlistActions({ item, run }) {
    async function addToCartAndOpen() {
        const result = await run(() => api.addToCart(item.id, 1), 'Added to cart')
        if (result) {
            navigate('/cart')
        }
    }

    return (
        <>
            {item.quantity > 0 ? (
                <button className="w-btn primary" onClick={addToCartAndOpen}>
                    Add to cart
                </button>
            ) : (
                <button className="w-btn primary" disabled>
                    Out of stock
                </button>
            )}
            <button className="w-btn ghost" onClick={() => run(() => api.removeFromWishlist(item.id))}>
                Remove
            </button>
        </>
    )
}

export function WishlistPage({ run }) {
    const items = useApi(api.getWishlist, [], [])

    return (
        <section className="page">
            <h1>
                Wishlist <span className="sub">({items.length})</span>
            </h1>
            {items.length === 0 ? (
                <EmptyState>Nothing saved yet. Tap the heart on any product.</EmptyState>
            ) : (
                <div className="list">
                    {items.map((item) => (
                        <ListRow
                            key={item.id}
                            image={item.image}
                            title={item.product_name}
                            href={'#/product/' + item.product_id}
                            meta={`${item.label} · ${item.sku}`}
                            badges={<StockBadge variant={item} />}
                            right={<strong>{formatMoney(item.price)}</strong>}
                            actions={<WishlistActions item={item} run={run} />}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
