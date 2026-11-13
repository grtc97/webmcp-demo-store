import { formatMoney } from '../utils/format'

export function OrderSummary({ cart, children }) {
    return (
        <aside className="summary card">
            <h2>Order summary</h2>
            <div className="row">
                <span>Items ({cart.item_count})</span>
                <span>{formatMoney(cart.total)}</span>
            </div>
            <div className="row">
                <span>Delivery</span>
                <span className="good">Free</span>
            </div>
            <div className="row totalrow">
                <span>Total</span>
                <strong>{formatMoney(cart.total)}</strong>
            </div>
            {children}
        </aside>
    )
}
