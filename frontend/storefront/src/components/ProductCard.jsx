import { Heart } from 'lucide-react'

import { api } from '../services/api'
import { navigate } from '../services/router'
import { formatMoney } from '../utils/format'
import { Badge, Card } from '../widgets'

function pickDefaultVariant(product) {
    return product.variants.find((variant) => variant.quantity > 0) || product.variants[0]
}

function StockNote({ status }) {
    if (status === 'out_of_stock') {
        return <Badge tone="bad">Out of stock</Badge>
    }
    if (status === 'low_stock') {
        return <Badge tone="warn">Few left</Badge>
    }
    return null
}

function CardAction({ product, variant, hasOptions, run }) {
    if (hasOptions) {
        return (
            <button className="w-btn outline block" onClick={() => navigate('/product/' + product.id)}>
                Choose option
            </button>
        )
    }
    if (variant.quantity > 0) {
        return (
            <button className="w-btn primary block" onClick={() => run(() => api.addToCart(variant.id, 1), 'Added to cart')}>
                Add to cart
            </button>
        )
    }
    return (
        <button className="w-btn outline block" disabled>
            Out of stock
        </button>
    )
}

function WishlistHeart({ variant, run }) {
    const toggleWishlist = () =>
        run(
            () => (variant.wishlisted ? api.removeFromWishlist(variant.id) : api.addToWishlist(variant.id)),
            variant.wishlisted ? '' : 'Saved to wishlist',
        )

    return (
        <button
            className={'w-heart' + (variant.wishlisted ? ' on' : '')}
            aria-label={variant.wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={toggleWishlist}
        >
            <Heart size={17} fill={variant.wishlisted ? 'currentColor' : 'none'} />
        </button>
    )
}

// The store's product card is just the generic <Card> filled with product data.
export function ProductCard({ product, run }) {
    const variant = pickDefaultVariant(product)
    const hasOptions = product.variants.length > 1

    return (
        <Card
            data-product-id={product.id}
            image={product.image}
            alt={product.name}
            ratio="var(--img-ratio)"
            href={'#/product/' + product.id}
            eyebrow={product.category}
            title={product.name}
            price={(hasOptions ? 'From ' : '') + formatMoney(product.price_from)}
            badges={<StockNote status={product.status} />}
            corner={<WishlistHeart variant={variant} run={run} />}
            actions={<CardAction product={product} variant={variant} hasOptions={hasOptions} run={run} />}
        />
    )
}
