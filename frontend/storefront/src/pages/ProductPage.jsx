import { useEffect, useState } from 'react'

import { Heart, ShieldCheck, Truck } from 'lucide-react'

import { EmptyState } from '../components/EmptyState'
import { ProductCard } from '../components/ProductCard'
import { StockBadge } from '../components/StockBadge'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { navigate } from '../services/router'
import { filtersForCategory } from '../utils/filters'
import { formatMoney } from '../utils/format'
import { CardGrid, Photo, Stepper } from '../widgets'

const RELATED_PRODUCTS_LIMIT = 4
const NOT_FOUND = false

function pickVariant(product, selectedVariantId) {
    return (
        product.variants.find((variant) => variant.id === selectedVariantId) ||
        product.variants.find((variant) => variant.quantity > 0) ||
        product.variants[0]
    )
}

function findRelatedProducts(allProducts, product) {
    if (!product) {
        return []
    }
    return allProducts
        .filter((candidate) => candidate.category === product.category && candidate.id !== product.id)
        .slice(0, RELATED_PRODUCTS_LIMIT)
}

function Gallery({ product, photoIndex, onSelectPhoto }) {
    const images = product.images
    return (
        <div className="gallery">
            <Photo
                src={images[Math.min(photoIndex, images.length - 1)] || null}
                alt={product.name}
                w={900}
                ratio="1/1"
                className="pdp-photo"
            />
            {images.length > 1 && (
                <div className="thumbs" role="tablist" aria-label="Product photos">
                    {images.map((src, index) => (
                        <button
                            key={src}
                            role="tab"
                            aria-selected={index === photoIndex}
                            aria-label={`Photo ${index + 1}`}
                            className={index === photoIndex ? 'on' : ''}
                            onClick={() => onSelectPhoto(index)}
                        >
                            <Photo src={src} alt="" w={120} ratio="1/1" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function VariantPicker({ variants, selectedVariant, onSelect }) {
    return (
        <>
            <div className="optlabel">
                Variant: <strong>{selectedVariant.label}</strong>
            </div>
            <div className="opts" role="radiogroup" aria-label="Variant">
                {variants.map((variant) => {
                    const isSelected = variant.id === selectedVariant.id
                    const isSoldOut = variant.quantity === 0
                    return (
                        <button
                            key={variant.id}
                            role="radio"
                            aria-checked={isSelected}
                            className={'opt' + (isSelected ? ' on' : '') + (isSoldOut ? ' oos' : '')}
                            onClick={() => onSelect(variant.id)}
                        >
                            {variant.label}
                            <small>
                                {formatMoney(variant.price)}
                                {isSoldOut ? ' · sold out' : ''}
                            </small>
                        </button>
                    )
                })}
            </div>
        </>
    )
}

function SpecsTable({ specs }) {
    if (Object.keys(specs).length === 0) {
        return null
    }
    return (
        <section className="specs">
            <h2>Specifications</h2>
            <table>
                <tbody>
                    {Object.entries(specs).map(([name, value]) => (
                        <tr key={name}>
                            <th>{name.replace(/_/g, ' ')}</th>
                            <td>{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    )
}

export function ProductPage({ id, run, setFilters }) {
    const product = useApi(() => api.getProduct(id).catch(() => NOT_FOUND), [id], null)
    const relatedProducts = useApi(
        () => api.searchProducts({}).then((allProducts) => findRelatedProducts(allProducts, product)),
        [id, product && product.category],
        [],
    )
    const [selectedVariantId, setSelectedVariantId] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [photoIndex, setPhotoIndex] = useState(0)

    useEffect(() => setPhotoIndex(0), [id])

    if (product === null) {
        return null
    }
    if (product === NOT_FOUND) {
        return (
            <EmptyState>
                Product not found. <a href="#/">Back to shop</a>
            </EmptyState>
        )
    }

    const variant = pickVariant(product, selectedVariantId)
    const quantityToAdd = Math.min(quantity, Math.max(1, variant.quantity))

    async function addToCart(nextPath) {
        const result = await run(() => api.addToCart(variant.id, quantityToAdd), 'Added to cart')
        if (result && nextPath) {
            navigate(nextPath)
        }
    }

    function selectVariant(variantId) {
        setSelectedVariantId(variantId)
        setQuantity(1)
    }

    function toggleWishlist() {
        run(
            () => (variant.wishlisted ? api.removeFromWishlist(variant.id) : api.addToWishlist(variant.id)),
            variant.wishlisted ? '' : 'Saved to wishlist',
        )
    }

    return (
        <div className="pdp">
            <nav className="crumbs" aria-label="Breadcrumb">
                <a href="#/">Home</a> ›{' '}
                <a href="#/" onClick={() => setFilters(filtersForCategory(product.category))}>
                    {product.category}
                </a>{' '}
                › {product.name}
            </nav>
            <div className="pdpgrid">
                <Gallery product={product} photoIndex={photoIndex} onSelectPhoto={setPhotoIndex} />
                <div className="pinfo">
                    <span className="w-eyebrow">{product.category}</span>
                    <h1>{product.name}</h1>
                    <p className="desc">{product.description}</p>
                    <div className="price big">
                        {formatMoney(variant.price)} <span className="sub">per unit, delivery included</span>
                    </div>
                    <div className="row">
                        <StockBadge variant={variant} />
                        {variant.status === 'low_stock' && <span className="warn">Only {variant.quantity} left</span>}
                    </div>

                    <VariantPicker variants={product.variants} selectedVariant={variant} onSelect={selectVariant} />

                    {variant.quantity > 0 ? (
                        <>
                            <div className="row start">
                                <Stepper value={quantityToAdd} max={variant.quantity} onChange={setQuantity} />
                            </div>
                            <div className="row start buy">
                                <button className="w-btn primary lg" onClick={() => addToCart()}>
                                    Add to cart
                                </button>
                                <button className="w-btn dark lg" onClick={() => addToCart('/checkout')}>
                                    Buy now
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="soldout">
                            <p>
                                <strong>Currently unavailable.</strong> This option is out of stock.
                            </p>
                        </div>
                    )}
                    <button className={'w-btn ghost wishbtn' + (variant.wishlisted ? ' on' : '')} onClick={toggleWishlist}>
                        <Heart size={16} fill={variant.wishlisted ? 'currentColor' : 'none'} />{' '}
                        {variant.wishlisted ? 'In your wishlist' : 'Add to wishlist'}
                    </button>

                    <ul className="assure">
                        <li>
                            <Truck size={16} /> Ships in 48 hours across India
                        </li>
                        <li>
                            <ShieldCheck size={16} /> {product.specs.warranty || '1-year'} warranty · SKU {variant.sku}
                        </li>
                    </ul>
                </div>
            </div>

            <SpecsTable specs={product.specs} />
            {relatedProducts.length > 0 && (
                <section>
                    <h2>More in {product.category}</h2>
                    <CardGrid min={220}>
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} run={run} />
                        ))}
                    </CardGrid>
                </section>
            )}
        </div>
    )
}
