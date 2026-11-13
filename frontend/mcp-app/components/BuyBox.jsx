import { useState } from 'react'

import { StockBadge } from '@storefront/components/StockBadge'
import { formatMoney } from '@storefront/utils/format'
import { Stepper } from '@storefront/widgets'

import { useRun } from '../hooks/useStore'
import { ToolButton } from './ToolButton'

function pickInitialVariantId(product, initialId) {
    if (initialId != null) {
        return initialId
    }
    return (product.variants.find((variant) => variant.quantity > 0) ?? product.variants[0]).id
}

// Variant select, quantity, add to cart and save for one product.
export function BuyBox({ product, initialId }) {
    const { busy } = useRun()
    const [variantId, setVariantId] = useState(() => pickInitialVariantId(product, initialId))
    const [quantity, setQuantity] = useState(1)
    const variant = product.variants.find((candidate) => candidate.id === variantId)

    function selectVariant(event) {
        setVariantId(Number(event.target.value))
        setQuantity(1)
    }

    return (
        <div>
            <label className="app-form">
                <select value={variantId} onChange={selectVariant} disabled={!!busy} aria-label="Variant">
                    {product.variants.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.label} · {formatMoney(option.price)} · {option.quantity} available
                        </option>
                    ))}
                </select>
            </label>
            <p>
                <StockBadge variant={variant} /> <strong>{formatMoney(variant.price)}</strong>
            </p>
            <div className="app-actions">
                <Stepper value={quantity} max={Math.max(1, variant.quantity)} onChange={setQuantity} />
                <ToolButton tool="add_to_cart" args={{ variant_id: variant.id, quantity }} tone="primary" disabled={variant.quantity < 1}>
                    Add to cart
                </ToolButton>
                <ToolButton tool={variant.wishlisted ? 'remove_from_wishlist' : 'add_to_wishlist'} args={{ variant_id: variant.id }}>
                    {variant.wishlisted ? 'Unsave' : 'Save'}
                </ToolButton>
            </div>
        </div>
    )
}
