import { CartPage } from './CartPage'
import { CatalogPage } from './CatalogPage'
import { CheckoutPage } from './CheckoutPage'
import { ConfirmationPage } from './ConfirmationPage'
import { OrdersPage } from './OrdersPage'
import { ProductPage } from './ProductPage'
import { WishlistPage } from './WishlistPage'

// One page per snapshot `view` returned by the MCP server.
export const PAGES = {
    catalog: CatalogPage,
    product: ProductPage,
    wishlist: WishlistPage,
    cart: CartPage,
    checkout: CheckoutPage,
    confirmation: ConfirmationPage,
    orders: OrdersPage,
}

// Local state (variant, quantity, form fields) resets when this changes.
export function getPageKey(snapshot) {
    return [snapshot.view, snapshot.product?.id, JSON.stringify(snapshot.filters)].join(':')
}
