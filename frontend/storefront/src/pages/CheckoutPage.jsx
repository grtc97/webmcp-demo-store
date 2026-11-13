import { useState } from 'react'

import { EmptyState } from '../components/EmptyState'
import { OrderSummary } from '../components/OrderSummary'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { navigate } from '../services/router'
import { formatMoney } from '../utils/format'

const EMPTY_CART = { items: [], total: 0, item_count: 0 }

const CHECKOUT_FIELDS = [
    { key: 'name', label: 'Full name', type: 'text', autoComplete: 'name', width: 'wide' },
    { key: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
    { key: 'address', label: 'Street address', type: 'text', autoComplete: 'street-address', width: 'wide' },
    { key: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
    { key: 'postal_code', label: 'Postal code', type: 'text', autoComplete: 'postal-code' },
]

const BLANK_FORM = Object.fromEntries(CHECKOUT_FIELDS.map((field) => [field.key, '']))

export function CheckoutPage() {
    const cart = useApi(api.getCart, [], EMPTY_CART)
    const [form, setForm] = useState(BLANK_FORM)
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (cart.items.length === 0) {
        return (
            <section className="page">
                <EmptyState>
                    Your cart is empty. <a href="#/">Continue shopping</a>
                </EmptyState>
            </section>
        )
    }

    const updateField = (key, value) => setForm({ ...form, [key]: value })

    async function submitOrder(event) {
        event.preventDefault()
        setIsSubmitting(true)
        try {
            const order = await api.placeOrder(form)
            setError('')
            setForm(BLANK_FORM)
            navigate('/orders?placed=' + order.id)
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="page">
            <h1>Checkout</h1>
            <div className="two">
                <form onSubmit={submitOrder} className="card" noValidate aria-label="Delivery details">
                    <h2>Delivery details</h2>
                    <div className="formgrid">
                        {CHECKOUT_FIELDS.map((field) => (
                            <label className={'field ' + (field.width || '')} key={field.key}>
                                {field.label}
                                <input
                                    name={field.key}
                                    type={field.type}
                                    autoComplete={field.autoComplete}
                                    value={form[field.key]}
                                    onChange={(event) => updateField(field.key, event.target.value)}
                                />
                            </label>
                        ))}
                    </div>
                    <h2>Payment</h2>
                    <p className="sub">Demo store: no payment is taken. Orders are saved in this browser.</p>
                    {error && (
                        <p className="error" role="alert">
                            {error}
                        </p>
                    )}
                    <button className="w-btn primary lg" type="submit" disabled={isSubmitting}>
                        Place order · {formatMoney(cart.total)}
                    </button>
                </form>
                <OrderSummary cart={cart}>
                    <ul className="mini">
                        {cart.items.map((item) => (
                            <li key={item.variant_id}>
                                <span>
                                    {item.quantity} × {item.product_name} ({item.label})
                                </span>
                                <span>{formatMoney(item.subtotal)}</span>
                            </li>
                        ))}
                    </ul>
                </OrderSummary>
            </div>
        </section>
    )
}
