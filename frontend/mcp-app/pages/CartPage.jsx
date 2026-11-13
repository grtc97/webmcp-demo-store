import { EmptyState } from '@storefront/components/EmptyState'
import { SectionHeader } from '@storefront/widgets'

import { CartLines } from '../components/CartLines'
import { ToolButton } from '../components/ToolButton'

export function CartPage({ snapshot }) {
    const isEmpty = snapshot.cart.items.length === 0

    return (
        <>
            <SectionHeader title="Your cart" />
            {isEmpty ? <EmptyState>Your cart is empty.</EmptyState> : <CartLines cart={snapshot.cart} />}
            <div className="app-actions">
                <ToolButton tool="show_checkout" tone="primary" disabled={isEmpty}>
                    Continue to checkout
                </ToolButton>
                <ToolButton tool="search_products">Continue shopping</ToolButton>
            </div>
        </>
    )
}
