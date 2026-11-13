import { STOCK_STATUS_LABELS, STOCK_STATUS_TONES } from '../utils/format'
import { Badge } from '../widgets'

// Stock status of one variant, with the live quantity when there is any.
export function StockBadge({ variant }) {
    const quantityNote = variant.quantity > 0 ? ` · ${variant.quantity}` : ''
    return (
        <Badge tone={STOCK_STATUS_TONES[variant.status]}>
            {STOCK_STATUS_LABELS[variant.status]}
            {quantityNote}
        </Badge>
    )
}
