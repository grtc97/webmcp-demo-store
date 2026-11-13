import { EmptyState } from '@storefront/components/EmptyState'
import { StockBadge } from '@storefront/components/StockBadge'
import { formatMoney } from '@storefront/utils/format'
import { ListRow, SectionHeader } from '@storefront/widgets'

import { ToolButton } from '../components/ToolButton'

export function WishlistPage({ snapshot }) {
    return (
        <>
            <SectionHeader title="Wishlist" />
            {snapshot.wishlist.length === 0 && <EmptyState>Nothing saved yet.</EmptyState>}
            {snapshot.wishlist.map((item) => (
                <ListRow
                    key={item.id}
                    image={item.image}
                    title={item.product_name}
                    meta={`${item.label} · ${formatMoney(item.price)}`}
                    badges={<StockBadge variant={item} />}
                    actions={
                        <>
                            <ToolButton
                                tool="add_to_cart"
                                args={{ variant_id: item.id, quantity: 1 }}
                                tone="primary"
                                disabled={item.quantity < 1}
                            >
                                Add to cart
                            </ToolButton>
                            <ToolButton tool="remove_from_wishlist" args={{ variant_id: item.id }}>
                                Remove
                            </ToolButton>
                        </>
                    }
                />
            ))}
        </>
    )
}
