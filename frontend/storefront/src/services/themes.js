// Category themes: when someone browses a category the whole store changes colours,
// shapes and hero. Design tokens live in styles/store.css under [data-theme="<key>"].
import { unsplashUrl } from '../utils/format'

// Share of search results that must come from one category before the store adopts its look.
const QUERY_THEME_THRESHOLD = 0.6

export const THEMES = {
    'Tech & Gadgets': {
        key: 'tech',
        label: 'Tech',
        announce: 'Free delivery. One-year warranty on every gadget.',
        hero: {
            title: 'Tech that earns its desk space.',
            sub: 'Headphones, phones, watches and speakers, picked for how they work day to day.',
            image: unsplashUrl('1511707171634-5f897ff02aa9'),
        },
    },
    Apparel: {
        key: 'apparel',
        label: 'Style',
        announce: 'Free delivery. Returns accepted within 7 days.',
        hero: {
            title: 'Clothes you will reach for first.',
            sub: 'Easy basics, good denim and shoes that survive the commute.',
            image: unsplashUrl('1521572163474-6864f9cf17ab'),
        },
    },
    'Home & Living': {
        key: 'living',
        label: 'Home',
        announce: 'Free delivery on every home order.',
        hero: {
            title: 'Small upgrades for every room.',
            sub: 'Cookware that lasts, bedding that is actually soft, a lamp for the corner.',
            image: unsplashUrl('1556910096-6f5e72db6803'),
        },
    },
    'Personal Care': {
        key: 'care',
        label: 'Care',
        announce: 'Free delivery. A sample in every order.',
        hero: {
            title: 'A short routine that works.',
            sub: 'Serum, sunscreen and a hair dryer that does not take forever.',
            image: unsplashUrl('1784294331171-6deaf6847268'),
        },
    },
    'Sports & Outdoors': {
        key: 'outdoors',
        label: 'Sport',
        announce: 'Free delivery. 30-day returns on all gear.',
        hero: {
            title: 'Gear for the next session.',
            sub: 'Mats, dumbbells and bottles that keep up with you.',
            image: unsplashUrl('1759674861540-afed9f86f94a'),
        },
    },
    Reading: {
        key: 'reading',
        label: 'Reading',
        announce: 'Free delivery on every book.',
        hero: {
            title: 'Pick a good one for tonight.',
            sub: 'Practical reads and cookbooks to leave on the kitchen shelf.',
            image: unsplashUrl('1588960952097-4cf35f0a0306'),
        },
    },
    'Toys & Play': {
        key: 'play',
        label: 'Play',
        announce: 'Free delivery. Gift wrapping on request.',
        hero: {
            title: 'Things to build, solve and laugh at.',
            sub: 'Blocks and board games for kids, and for the grown-ups who join in.',
            image: unsplashUrl('1784397375428-7a2c2e781d84'),
        },
    },
    'Pantry Foods': {
        key: 'pantry',
        label: 'Pantry',
        announce: 'Free delivery in 48 hours.',
        hero: {
            title: 'Pantry staples, no fuss.',
            sub: 'Good tea, nuts and the things you keep running out of.',
            image: unsplashUrl('1767877609689-beff32b9c0ac'),
        },
    },
    'Office & Stationery': {
        key: 'office',
        label: 'Office',
        announce: 'Free delivery. Bulk discounts on office orders.',
        hero: {
            title: 'Everything for a tidy desk.',
            sub: 'Notebooks, pens and organizers that make planning a little easier.',
            image: unsplashUrl('1774878520736-6cacbcce1b7b'),
        },
    },
}

export const DEFAULT_THEME = {
    key: 'default',
    label: '',
    announce: 'Free delivery on every order. Easy returns for 7 days.',
    hero: {
        title: 'Good things for everyday life.',
        sub: 'Gadgets, apparel, home living, reading and more, all in one place.',
        image: unsplashUrl('1773332598501-f8612761781a'),
    },
}

export function themeFor(category) {
    return THEMES[category] || DEFAULT_THEME
}

function dominantCategory(products) {
    const countsByCategory = {}
    products.forEach((product) => {
        countsByCategory[product.category] = (countsByCategory[product.category] || 0) + 1
    })
    const [category, count] = Object.entries(countsByCategory).sort((first, second) => second[1] - first[1])[0]
    return count / products.length >= QUERY_THEME_THRESHOLD ? category : null
}

// Which category should the store look like right now?
//   string: that category ('' for the default look)
//   null:   this page does not decide, keep the current look
export function inferCategory({ page, product, filters, results }) {
    if (page === 'product') {
        return product ? product.category : null
    }
    if (page === 'widgets') {
        return ''
    }
    if (page !== 'home') {
        return null
    }
    if (filters.category) {
        return filters.category
    }
    if (filters.query && results.length) {
        const category = dominantCategory(results)
        if (category) {
            return category
        }
    }
    return ''
}
