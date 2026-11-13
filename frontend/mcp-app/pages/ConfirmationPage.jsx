import { SectionHeader } from '@storefront/widgets'

import { OrderCard } from '../components/OrderCard'
import { ToolButton } from '../components/ToolButton'

export function ConfirmationPage({ snapshot }) {
    return (
        <>
            <SectionHeader title="Demo order placed" sub="No payment taken, shipment arranged, or email sent." />
            <OrderCard order={snapshot.order} />
            <ToolButton tool="search_products" tone="primary">
                Continue shopping
            </ToolButton>
        </>
    )
}
