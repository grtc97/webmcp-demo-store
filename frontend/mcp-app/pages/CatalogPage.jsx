import { EmptyState } from '@storefront/components/EmptyState'
import { STOCK_STATUS_LABELS, STOCK_STATUS_TONES, formatMoney } from '@storefront/utils/format'
import { Badge, Card, CardGrid, SectionHeader } from '@storefront/widgets'

import { FilterForm } from '../components/FilterForm'
import { ToolButton } from '../components/ToolButton'
import { buildPageArgs } from '../utils/searchArgs'

const EMPTY_FILTERS = { query: '', category: '', status: '', min_price: '', max_price: '', sort: 'relevance' }

function describeRange(page, shownCount) {
    if (page.total === 0) {
        return '0 products'
    }
    return `Showing ${page.offset + 1}–${page.offset + shownCount} of ${page.total} products`
}

function Pager({ filters, page }) {
    const previousArgs = buildPageArgs(filters, page, -1)
    const nextArgs = buildPageArgs(filters, page, 1)
    if (!previousArgs && !nextArgs) {
        return null
    }
    return (
        <div className="app-actions">
            <ToolButton tool="search_products" args={previousArgs} disabled={!previousArgs}>
                Previous
            </ToolButton>
            <ToolButton tool="search_products" args={nextArgs} disabled={!nextArgs}>
                Next
            </ToolButton>
        </div>
    )
}

export function CatalogPage({ snapshot }) {
    const { products, categories, page } = snapshot
    const filters = { ...EMPTY_FILTERS, ...snapshot.filters }

    return (
        <>
            <FilterForm filters={filters} categories={categories} />
            <SectionHeader title={describeRange(page, products.length)} />
            {products.length === 0 ? (
                <EmptyState>No products match these filters.</EmptyState>
            ) : (
                <CardGrid min={200}>
                    {products.map((product) => (
                        <Card
                            key={product.id}
                            image={product.image}
                            title={product.name}
                            eyebrow={product.category}
                            price={`From ${formatMoney(product.price_from)}`}
                            badges={<Badge tone={STOCK_STATUS_TONES[product.status]}>{STOCK_STATUS_LABELS[product.status]}</Badge>}
                            actions={
                                <ToolButton tool="get_product" args={{ product_id: product.id }}>
                                    View options
                                </ToolButton>
                            }
                        />
                    ))}
                </CardGrid>
            )}
            <Pager filters={filters} page={page} />
        </>
    )
}
