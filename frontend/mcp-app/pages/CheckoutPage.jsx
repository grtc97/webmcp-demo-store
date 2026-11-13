import { useState } from 'react'

import { SectionHeader } from '@storefront/widgets'

import { CartLines } from '../components/CartLines'
import { ToolButton } from '../components/ToolButton'
import { useRun } from '../hooks/useStore'

const CUSTOMER_FIELDS = [
    { key: 'name', label: 'Full name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'postal_code', label: 'Postal code', type: 'text' },
]

const BLANK_CUSTOMER = Object.fromEntries(CUSTOMER_FIELDS.map((field) => [field.key, '']))

export function CheckoutPage({ snapshot }) {
    const { run, busy } = useRun()
    const [customer, setCustomer] = useState(BLANK_CUSTOMER)
    const [isConfirmed, setIsConfirmed] = useState(false)

    // Editing any detail clears the confirmation, so the user re-confirms what they will order.
    function editField(key, value) {
        setCustomer({ ...customer, [key]: value })
        setIsConfirmed(false)
    }

    function submit(event) {
        event.preventDefault()
        run('place_order', { customer, confirmed: isConfirmed })
    }

    return (
        <>
            <SectionHeader
                title="Checkout"
                sub="Use fictional details. This is a demo."
                action={<ToolButton tool="get_cart">Edit cart</ToolButton>}
            />
            <CartLines cart={snapshot.cart} editable={false} />
            <form className="app-form" onSubmit={submit}>
                {CUSTOMER_FIELDS.map((field) => (
                    <label key={field.key}>
                        {field.label}
                        <input
                            type={field.type}
                            required
                            value={customer[field.key]}
                            onChange={(event) => editField(field.key, event.target.value)}
                        />
                    </label>
                ))}
                <label>
                    <span>
                        <input type="checkbox" checked={isConfirmed} onChange={(event) => setIsConfirmed(event.target.checked)} /> I
                        reviewed this cart and confirm a demo order
                    </span>
                </label>
                <button className="w-btn primary" disabled={!isConfirmed || !!busy}>
                    Place demo order
                </button>
            </form>
        </>
    )
}
