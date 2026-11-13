import { CheckCircle2 } from 'lucide-react'

import { EmptyState } from '../components/EmptyState'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { formatMoney } from '../utils/format'

function OrderPlacedBanner({ orderId }) {
    return (
        <div className="success" role="status">
            <CheckCircle2 />{' '}
            <div>
                <strong>Order {orderId} placed!</strong>
                <div className="sub">A confirmation would be emailed to you. Thank you for shopping with ShopChrem.</div>
            </div>
        </div>
    )
}

function OrderCard({ order, isNew }) {
    const { customer } = order
    return (
        <div className={'card order' + (isNew ? ' new' : '')}>
            <div className="row">
                <strong>{order.id}</strong>
                <span className="w-badge good">{order.status}</span>
                <span className="sub">{new Date(order.created_at).toLocaleString()}</span>
            </div>
            {order.items.map((item) => (
                <div className="row" key={item.variant_id}>
                    <span>
                        {item.quantity} × {item.product_name} ({item.label})
                    </span>
                    <span>{formatMoney(item.subtotal)}</span>
                </div>
            ))}
            <div className="row totalrow">
                <span>Total</span>
                <strong>{formatMoney(order.total)}</strong>
            </div>
            <p className="sub">
                Ship to {customer.name}, {customer.address}, {customer.city} {customer.postal_code} · {customer.email} · {customer.phone}
            </p>
        </div>
    )
}

export function OrdersPage({ placedOrderId }) {
    const orders = useApi(api.getOrders, [], [])

    return (
        <section className="page">
            {placedOrderId && <OrderPlacedBanner orderId={placedOrderId} />}
            <h1>Your orders</h1>
            {orders.length === 0 ? (
                <EmptyState>
                    No orders yet. <a href="#/">Start shopping</a>
                </EmptyState>
            ) : (
                orders.map((order) => <OrderCard key={order.id} order={order} isNew={order.id === placedOrderId} />)
            )}
        </section>
    )
}
