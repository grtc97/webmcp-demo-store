import { LOW_STOCK_AT } from '@shared/store.js'
import { Trash2 } from 'lucide-react'

import { EmptyState } from '../components/EmptyState'
import { OrderSummary } from '../components/OrderSummary'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { formatMoney } from '../utils/format'
import { ListRow, Stepper } from '../widgets'

const EMPTY_CART = { items: [], total: 0, item_count: 0 }

function CartLine({ item, run }) {
    const isRunningLow = item.available <= LOW_STOCK_AT
    return (
        <ListRow
            image={item.image}
            title={item.product_name}
            href={'#/product/' + item.product_id}
            meta={
                <>
                    {item.label} · {formatMoney(item.price)} each
                    {isRunningLow && <span className="warn"> · only {item.available} left</span>}
                </>
            }
            right={
                <>
                    <Stepper
                        value={item.quantity}
                        max={item.available}
                        label={`Quantity of ${item.sku}`}
                        onChange={(quantity) => run(() => api.setCartQuantity(item.variant_id, quantity))}
                    />
                    <strong className="linetotal">{formatMoney(item.subtotal)}</strong>
                </>
            }
            actions={
                <button
                    className="icon"
                    aria-label={`Remove ${item.product_name}`}
                    onClick={() => run(() => api.removeFromCart(item.variant_id))}
                >
                    <Trash2 size={18} />
                </button>
            }
        />
    )
}

export function CartPage({ run }) {
    const cart = useApi(api.getCart, [], EMPTY_CART)

    return (
        <section className="page">
            <h1>Your cart</h1>
            {cart.items.length === 0 ? (
                <EmptyState>
                    Your cart is empty. <a href="#/">Keep shopping</a>
                </EmptyState>
            ) : (
                <div className="two">
                    <div className="list">
                        {cart.items.map((item) => (
                            <CartLine key={item.variant_id} item={item} run={run} />
                        ))}
                    </div>
                    <OrderSummary cart={cart}>
                        <a className="w-btn primary lg block" href="#/checkout">
                            Go to checkout
                        </a>
                    </OrderSummary>
                </div>
            )}
        </section>
    )
}
