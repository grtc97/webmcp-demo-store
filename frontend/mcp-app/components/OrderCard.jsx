import { formatMoney } from '@storefront/utils/format'

export function OrderCard({ order }) {
    return (
        <article className="app-order">
            <strong>{order.id}</strong> · {new Date(order.created_at).toLocaleString('en-IN')} · {order.status}
            <ul>
                {order.items.map((item) => (
                    <li key={item.variant_id}>
                        {item.quantity} × {item.product_name} ({item.label}) · {formatMoney(item.subtotal)}
                    </li>
                ))}
            </ul>
            <div className="app-total">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
            </div>
        </article>
    )
}
