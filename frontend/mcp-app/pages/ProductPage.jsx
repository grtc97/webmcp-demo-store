import { DataTable } from '@storefront/widgets'

import { BuyBox } from '../components/BuyBox'
import { Gallery } from '../components/Gallery'

const SPEC_COLUMNS = [
    { key: 'spec', header: 'Specification' },
    { key: 'value', header: 'Value' },
]

function toSpecRows(specs) {
    return Object.entries(specs ?? {}).map(([spec, value]) => ({ spec: spec.replace(/_/g, ' '), value }))
}

export function ProductPage({ snapshot }) {
    const { product, variant } = snapshot

    return (
        <div className="app-split">
            <Gallery images={product.images} alt={product.name} />
            <div>
                <span className="w-eyebrow">{product.category}</span>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <BuyBox product={product} initialId={variant?.id} />
            </div>
            <div>
                <h3>Specifications</h3>
                <DataTable columns={SPEC_COLUMNS} rows={toSpecRows(product.specs)} rowKey="spec" empty="No specifications." />
            </div>
        </div>
    )
}
