import { EmptyState } from '../components/EmptyState'
import { ProductCard } from '../components/ProductCard'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { DEFAULT_FILTERS, filtersForCategory } from '../utils/filters'
import { CardGrid, FilterPanel, Hero, TileRow } from '../widgets'

const AVAILABILITY_OPTIONS = [
    { value: '', label: 'Any' },
    { value: 'in_stock', label: 'In stock' },
    { value: 'low_stock', label: 'Low stock' },
    { value: 'out_of_stock', label: 'Out of stock' },
]

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Featured' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'name', label: 'Name' },
]

const TILE_SCROLL_DELAY_MS = 50

function scrollToShopSmoothly() {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
}

function buildFilterFields(categories) {
    return [
        {
            type: 'radio',
            key: 'category',
            label: 'Category',
            options: [{ value: '', label: 'All categories' }, ...categories.map((category) => ({ value: category, label: category }))],
        },
        { type: 'radio', key: 'status', label: 'Availability', options: AVAILABILITY_OPTIONS },
        { type: 'range', label: 'Price (₹)', keys: ['min_price', 'max_price'], placeholders: ['Min', 'Max'] },
    ]
}

function buildCategoryTiles(categories, allProducts, onPick) {
    return categories.map((category) => {
        const productsInCategory = allProducts.filter((product) => product.category === category)
        return {
            label: category,
            image: productsInCategory[0]?.image,
            note: productsInCategory.length + ' items',
            onClick: () => onPick(category),
        }
    })
}

// Filters that differ from the defaults, shown as removable chips (sort is not a chip).
function getActiveFilters(filters) {
    return Object.entries(filters).filter(([key, value]) => value && value !== DEFAULT_FILTERS[key] && key !== 'sort')
}

function ResultsToolbar({ filters, setFilters, productCount }) {
    const activeFilters = getActiveFilters(filters)
    return (
        <div className="toolbar">
            <div>
                <strong>{productCount}</strong> {productCount === 1 ? 'product' : 'products'}
                {filters.query && <> matching “{filters.query}”</>}
                <div className="chips">
                    {activeFilters.map(([key, value]) => (
                        <button key={key} className="chip" onClick={() => setFilters({ ...filters, [key]: '' })}>
                            {String(value).replace('_', ' ')} ×
                        </button>
                    ))}
                </div>
            </div>
            <label className="inline">
                Sort
                <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    )
}

export function HomePage({ filters, setFilters, run, theme, products }) {
    const categories = useApi(api.categories, [], [])
    const allProducts = useApi(() => api.searchProducts({}), [], [])
    const isThemed = theme.key !== 'default'
    const hasDefaultFilters = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS)

    function pickCategoryTile(category) {
        setFilters(filtersForCategory(category))
        setTimeout(scrollToShopSmoothly, TILE_SCROLL_DELAY_MS)
    }

    return (
        <>
            <Hero
                title={theme.hero.title}
                text={theme.hero.sub}
                image={theme.hero.image}
                action={{ label: isThemed ? 'See the range' : 'Start shopping', onClick: scrollToShopSmoothly }}
            />
            {hasDefaultFilters && !isThemed && (
                <section className="home-tiles">
                    <h2>Shop by category</h2>
                    <TileRow items={buildCategoryTiles(categories, allProducts, pickCategoryTile)} />
                </section>
            )}

            <div className="shop" id="shop">
                <FilterPanel
                    fields={buildFilterFields(categories)}
                    values={filters}
                    onChange={(values) => setFilters({ ...filters, ...values })}
                    onClear={() => setFilters(DEFAULT_FILTERS)}
                />
                <section>
                    <ResultsToolbar filters={filters} setFilters={setFilters} productCount={products.length} />
                    {products.length === 0 ? (
                        <EmptyState>Nothing matches. Try removing a filter.</EmptyState>
                    ) : (
                        <CardGrid min={230}>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} run={run} />
                            ))}
                        </CardGrid>
                    )}
                </section>
            </div>
        </>
    )
}
