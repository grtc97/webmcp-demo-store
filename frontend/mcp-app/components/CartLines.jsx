import { formatMoney, pluralize } from '@storefront/utils/format'
import { ListRow, Stepper } from '@storefront/widgets'

import { useRun } from '../hooks/useStore'
import { ToolButton } from './ToolButton'

// Cart rows with the server's total. editable=false is the read-only checkout version.
export function CartLines({ cart, editable = true }) {
    const { run, busy } = useRun()

    function changeQuantity(item, quantity) {
        if (!busy) {
            run('set_cart_quantity', { variant_id: item.variant_id, quantity })
        }
    }

    return (
        <div>
            {cart.items.map((item) => (
                <ListRow
                    key={item.variant_id}
                    image={item.image}
                    title={item.product_name}
                    meta={`${item.label} · ${formatMoney(item.price)}`}
                    right={
                        editable
                            ? formatMoney(item.subtotal)
                            : `${item.quantity} × ${formatMoney(item.price)} = ${formatMoney(item.subtotal)}`
                    }
                    actions={
                        editable && (
                            <>
                                <Stepper
                                    value={item.quantity}
                                    min={0}
                                    max={item.available}
                                    label={`Quantity of ${item.product_name}`}
                                    onChange={(quantity) => changeQuantity(item, quantity)}
                                />
                                <ToolButton tool="remove_from_cart" args={{ variant_id: item.variant_id }}>
                                    Remove
                                </ToolButton>
                            </>
                        )
                    }
                />
            ))}
            <div className="app-total">
                <span>{pluralize(cart.item_count, 'item')}</span>
                <span>Total {formatMoney(cart.total)}</span>
            </div>
        </div>
    )
}
