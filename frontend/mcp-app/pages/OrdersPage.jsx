import { EmptyState } from '@storefront/components/EmptyState'
import { SectionHeader } from '@storefront/widgets'

import { OrderCard } from '../components/OrderCard'

export function OrdersPage({ snapshot }) {
    return (
        <>
            <SectionHeader title="Orders" />
            {snapshot.orders.length === 0 && <EmptyState>No orders yet.</EmptyState>}
            {snapshot.orders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </>
    )
}
