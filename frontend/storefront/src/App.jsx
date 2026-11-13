import { useEffect, useRef, useState } from 'react'

import { CategoryNav } from './components/CategoryNav'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { Toast } from './components/Toast'
import { useApi } from './hooks/useApi'
import { useRoute } from './hooks/useRoute'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ComponentLibraryPage } from './pages/ComponentLibraryPage'
import { HomePage } from './pages/HomePage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductPage } from './pages/ProductPage'
import { WishlistPage } from './pages/WishlistPage'
import { api } from './services/api'
import { navigate } from './services/router'
import { inferCategory, themeFor } from './services/themes'
import { onUIRequest } from './services/uiBus'
import { DEFAULT_FILTERS, filtersForCategory, filtersForQuery } from './utils/filters'
import { startWebMCP, tools } from './webmcp/registerWebMcp'

const VIEW_PATHS = { shop: '/', cart: '/cart', wishlist: '/wishlist', orders: '/orders', checkout: '/checkout' }
const TOAST_DURATION_MS = 3500
const ADDED_TO_CART_MESSAGE = 'Added to cart'
const INITIAL_WEBMCP_STATUS = { supported: false, count: 0, where: '', error: '' }
const EMPTY_CART = { item_count: 0 }

// Where a WebMCP tool asked the page to go.
function pathForUIRequest(request) {
    if (request.view === 'product') {
        return '/product/' + request.productId
    }
    if (request.view === 'orders' && request.placed) {
        return '/orders?placed=' + request.placed
    }
    return VIEW_PATHS[request.view] || '/'
}

function scrollToShop() {
    setTimeout(() => document.getElementById('shop')?.scrollIntoView(), 0)
}

export default function App() {
    const route = useRoute()
    const [filters, setFilters] = useState(DEFAULT_FILTERS)
    const [search, setSearch] = useState('')
    const [toast, setToast] = useState(null)
    const [themeCategory, setThemeCategory] = useState('')
    const [webMcpStatus, setWebMcpStatus] = useState(INITIAL_WEBMCP_STATUS)
    const toastTimer = useRef(null)

    useEffect(() => startWebMCP(setWebMcpStatus), [])

    useEffect(
        () =>
            onUIRequest((request) => {
                if (request.filters) {
                    setFilters({ ...DEFAULT_FILTERS, ...request.filters })
                    setSearch(request.filters.query || '')
                }
                if (request.view) {
                    navigate(pathForUIRequest(request))
                }
            }),
        [],
    )

    const categories = useApi(api.categories, [], [])
    const wishlist = useApi(api.getWishlist, [], [])
    const cart = useApi(api.getCart, [], EMPTY_CART)
    const results = useApi(() => api.searchProducts(filters), [JSON.stringify(filters)], [])
    const product = useApi(
        () => (route.page === 'product' ? api.getProduct(route.id).catch(() => null) : Promise.resolve(null)),
        [route.page, route.id],
        null,
    )

    // Re-skin the store for the category being browsed.
    const inferredCategory = inferCategory({ page: route.page, product, filters, results })
    useEffect(() => {
        if (inferredCategory !== null) {
            setThemeCategory(inferredCategory)
        }
    }, [inferredCategory])

    const theme = themeFor(themeCategory)
    useEffect(() => {
        document.documentElement.dataset.theme = theme.key
    }, [theme.key])

    function showToast(message, action) {
        if (!message) {
            return
        }
        setToast({ message, action })
        clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS)
    }

    // Runs one store action and reports the outcome in a toast. Returns null on failure.
    async function run(action, successMessage) {
        try {
            const result = await action()
            const toastAction = successMessage === ADDED_TO_CART_MESSAGE ? { label: 'View cart', to: '/cart' } : null
            showToast(successMessage, toastAction)
            return result ?? true
        } catch (error) {
            showToast(error.message)
            return null
        }
    }

    function goToShop() {
        navigate('/')
        scrollToShop()
    }

    function submitSearch(event) {
        event.preventDefault()
        setFilters(filtersForQuery(search))
        goToShop()
    }

    function pickCategory(category) {
        setFilters(filtersForCategory(category))
        setSearch('')
        goToShop()
    }

    function resetFilters() {
        setFilters(DEFAULT_FILTERS)
        setSearch('')
    }

    function resetDemoData() {
        if (confirm('Reset all demo data?')) {
            run(api.reset, 'Demo data reset')
        }
    }

    return (
        <>
            <div className="announce">{theme.announce}</div>
            <SiteHeader
                theme={theme}
                search={search}
                onSearchChange={setSearch}
                onSearchSubmit={submitSearch}
                onBrandClick={resetFilters}
                wishlistCount={wishlist.length}
                cartCount={cart.item_count}
            />
            <CategoryNav categories={categories} activeCategory={themeCategory} onPick={pickCategory} />

            <main>
                {route.page === 'home' && <HomePage filters={filters} setFilters={setFilters} run={run} theme={theme} products={results} />}
                {route.page === 'product' && <ProductPage id={route.id} run={run} setFilters={setFilters} />}
                {route.page === 'wishlist' && <WishlistPage run={run} />}
                {route.page === 'cart' && <CartPage run={run} />}
                {route.page === 'checkout' && <CheckoutPage />}
                {route.page === 'orders' && <OrdersPage placedOrderId={route.params.get('placed')} />}
                {route.page === 'widgets' && <ComponentLibraryPage />}
            </main>

            {!webMcpStatus.supported && (
                <p className="hint">
                    WebMCP is not available in this browser. Test tools in DevTools:{' '}
                    <code>await storefrontTools.search_products({'{query:"headphones"}'})</code>
                </p>
            )}
            <SiteFooter webMcpStatus={webMcpStatus} toolNames={tools.map((tool) => tool.name)} onReset={resetDemoData} />
            <Toast toast={toast} />
        </>
    )
}
