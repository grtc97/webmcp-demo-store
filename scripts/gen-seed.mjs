// One-off generator for shared/products.json. Run: node scripts/gen-seed.mjs
// WARNING: this does not write the `faq` entries now present in products.json (product 28).
// Running it overwrites the file and drops them, so back up products.json first.
import { writeFileSync } from 'node:fs'
// [name, category, description, specs, [[label, price INR, qty], ...]]
const P = [
    [
        'Wireless ANC Over-Ear Headphones',
        'Tech & Gadgets',
        'Over-ear Bluetooth headphones with 30-hour battery and active noise cancellation.',
        { battery: '30 hours', connectivity: 'Bluetooth 5.3', warranty: '1 year' },
        [
            ['Black', 7499, 0],
            ['Silver', 7499, 0],
            ['Blue', 7999, 4],
        ],
    ],
    [
        'Nova Smartphone 128GB',
        'Tech & Gadgets',
        '6.5-inch AMOLED display, 50MP camera and all-day battery.',
        { display: '6.5" AMOLED', storage: '128 GB', warranty: '1 year' },
        [
            ['Midnight', 17999, 15],
            ['Ocean Blue', 17999, 4],
            ['Sunset Gold', 18499, 2],
        ],
    ],
    [
        'Smartwatch Activity Tracker',
        'Tech & Gadgets',
        'Heart-rate, sleep and step tracking with a 7-day battery.',
        { battery: '7 days', water_resistance: '5 ATM' },
        [
            ['Black strap', 3299, 23],
            ['Green strap', 3299, 12],
        ],
    ],
    [
        'Pocket Bluetooth Speaker',
        'Tech & Gadgets',
        'Waterproof pocket speaker with 12 hours of playtime.',
        { battery: '12 hours', water_resistance: 'IPX7' },
        [
            ['Black', 2199, 28],
            ['Red', 2199, 0],
        ],
    ],
    [
        'Notebook Laptop 15.6-inch',
        'Tech & Gadgets',
        'Everyday laptop for work and study, with a fast SSD.',
        { ram: '16 GB', storage: '512 GB SSD', warranty: '1 year' },
        [
            ['Silver', 49999, 9],
            ['Space Grey', 51999, 3],
        ],
    ],
    [
        'Fast-Charge Power Bank 20000mAh',
        'Tech & Gadgets',
        'Fast-charging power bank with two USB ports and USB-C.',
        { capacity: '20000 mAh', output: '22.5 W' },
        [
            ['Black', 1699, 58],
            ['White', 1699, 37],
        ],
    ],
    [
        'Everyday Cotton Tee',
        'Apparel',
        'Soft everyday crew-neck tee in 100% combed cotton.',
        { fabric: '100% cotton', fit: 'Regular' },
        [
            ['S', 549, 38],
            ['M', 549, 58],
            ['L', 549, 16],
            ['XL', 549, 0],
        ],
    ],
    [
        'Slim Stretch Denim Jeans',
        'Apparel',
        'Stretch denim jeans with a comfortable mid-rise fit.',
        { fabric: 'Cotton stretch denim', fit: 'Slim' },
        [
            ['30', 1699, 17],
            ['32', 1699, 18],
            ['34', 1699, 5],
            ['36', 1699, 0],
        ],
    ],
    [
        'Daily Running Sneakers',
        'Apparel',
        'Lightweight cushioned trainers for daily runs.',
        { upper: 'Breathable mesh', sole: 'EVA foam' },
        [
            ['UK 7', 2799, 13],
            ['UK 8', 2799, 13],
            ['UK 9', 2799, 9],
            ['UK 10', 2799, 0],
        ],
    ],
    [
        'Genuine Leather Bifold Wallet',
        'Apparel',
        'Slim genuine-leather wallet with card slots and coin pocket.',
        { material: 'Genuine leather' },
        [
            ['Brown', 849, 33],
            ['Black', 849, 25],
        ],
    ],
    [
        'Daypack 25L',
        'Apparel',
        'Water-resistant backpack with padded laptop compartment.',
        { capacity: '25 litres' },
        [
            ['Navy', 1399, 26],
            ['Grey', 1399, 0],
        ],
    ],
    [
        'Stainless Electric Kettle 1.5L',
        'Home & Living',
        'Stainless steel kettle with auto shut-off.',
        { capacity: '1.5 L', power: '1500 W' },
        [
            ['Silver', 999, 45],
            ['Black', 999, 6],
        ],
    ],
    [
        'Cotton Bed Linen Set',
        'Home & Living',
        'Double bedsheet with two pillow covers, 144 thread count.',
        { fabric: '100% cotton' },
        [
            ['Blue stripes', 1199, 23],
            ['Floral', 1299, 0],
        ],
    ],
    [
        'LED Study Lamp',
        'Home & Living',
        'Dimmable desk lamp with three colour modes and USB charging.',
        { power: '10 W' },
        [
            ['White', 899, 4],
            ['Black', 899, 24],
        ],
    ],
    [
        'Vitamin C Brightening Serum',
        'Personal Care',
        'Brightening daily serum with 10% Vitamin C.',
        { size: '30 ml' },
        [
            ['30 ml', 549, 47],
            ['50 ml', 799, 15],
        ],
    ],
    [
        'Daily Sunscreen SPF 50',
        'Personal Care',
        'Lightweight, non-greasy broad-spectrum sunscreen.',
        { spf: '50 PA+++' },
        [
            ['50 g', 399, 73],
            ['100 g', 699, 0],
        ],
    ],
    [
        'Quick-Dry Hair Dryer 2000W',
        'Personal Care',
        'Fast-drying hair dryer with cool-shot and two speeds.',
        { power: '2000 W' },
        [['Black', 1199, 10]],
    ],
    [
        'Adjustable Dumbbell Pair Set',
        'Sports & Outdoors',
        'Pair of adjustable dumbbells, 2 to 10 kg each.',
        { weight: '2-10 kg each' },
        [
            ['10 kg pair', 3299, 10],
            ['20 kg pair', 5499, 3],
        ],
    ],
    [
        'Insulated Steel Flask',
        'Sports & Outdoors',
        'Keeps drinks cold for 24 hours and hot for 12.',
        { material: 'Stainless steel' },
        [
            ['500 ml', 749, 48],
            ['1 L', 999, 22],
        ],
    ],
    [
        'Better Habits Handbook (Paperback)',
        'Reading',
        'Practical guide to building routines that stick.',
        { format: 'Paperback', pages: '288' },
        [
            ['Paperback', 349, 43],
            ['Hardcover', 649, 9],
        ],
    ],
    [
        'Starter Kitchen Cookbook',
        'Reading',
        '100 easy recipes with photos for first-time cooks.',
        { format: 'Paperback', pages: '240' },
        [['Paperback', 449, 0]],
    ],
    [
        'Creative Blocks Set 500 pcs',
        'Toys & Play',
        'Colourful creative building set for ages 6 and up.',
        { pieces: '500', age: '6+' },
        [['500 pcs', 1199, 16]],
    ],
    [
        'Family Strategy Board Game',
        'Toys & Play',
        'Family board game for 2 to 6 players, 45 minutes.',
        { players: '2-6', age: '8+' },
        [['Standard', 1399, 12]],
    ],
    [
        'Salted Roasted Almonds',
        'Pantry Foods',
        'Lightly salted roasted almonds, resealable pouch.',
        { type: 'Roasted, salted' },
        [
            ['250 g', 279, 58],
            ['500 g', 499, 5],
        ],
    ],
    [
        'Hardcover Ruled Notebook A5',
        'Office & Stationery',
        'A5 hardcover notebook with 192 ruled pages, a ribbon bookmark and an elastic closure.',
        { size: 'A5', pages: '192 ruled', paper: '80 gsm' },
        [
            ['Black', 299, 40],
            ['Navy', 299, 4],
        ],
    ],
    [
        'Gel Pen Set 12 Colours',
        'Office & Stationery',
        'Smooth-writing 0.5 mm gel pens in 12 colours, quick drying and smudge resistant.',
        { tip: '0.5 mm', ink: 'Gel, quick drying' },
        [
            ['12 pens', 199, 55],
            ['24 pens', 349, 0],
        ],
    ],
    [
        'Wooden Pen and Pencil Holder',
        'Office & Stationery',
        'Solid wood desk holder with three compartments for pens, pencils and sticky notes.',
        { material: 'Solid wood', compartments: '3' },
        [
            ['Natural', 449, 17],
            ['Walnut', 499, 2],
        ],
    ],
    [
        'Pulse 3 Smartwatch with AMOLED Screen',
        'Tech & Gadgets',
        '1.43-inch AMOLED smartwatch with heart-rate, SpO2 and sleep tracking, built-in GPS and a 10-day battery. Water resistant to 5 ATM.',
        {
            display: '1.43" AMOLED',
            battery: 'Up to 10 days',
            sensors: 'Heart rate, SpO2, accelerometer',
            gps: 'Built-in',
            water_resistance: '5 ATM',
            connectivity: 'Bluetooth 5.3',
            compatibility: 'Android 8+ and iOS 14+',
            warranty: '1-year',
        },
        [
            ['Black strap', 4799, 21],
            ['Blue strap', 4799, 7],
        ],
    ],
    [
        'Smart Watch Ultra Max Plus',
        'Tech & Gadgets',
        'Best smart watch ever! Amazing display, super long battery, tracks everything. Perfect gift. 100% waterproof.',
        { battery: 'Long lasting', display: 'HD', features: 'All features' },
        [
            ['Black strap', 4799, 21],
            ['Blue strap', 4799, 7],
        ],
    ],
]
// Unsplash photo ids, one per product above (same order). Free to use under the Unsplash License.
const PHOTOS = [
    '1505740420928-5e560c06d30e',
    '1592890288564-76628a30a657',
    '1576243345690-4e4b79b63288',
    '1608043152269-423dbba4e7e1',
    '1496181133206-80ce9b88a853',
    '1760708825913-65a50b3dc39b',
    '1778671394516-8270eac13c42',
    '1602293589930-45aad59ba3ab',
    '1542291026-7eec264c27ff',
    '1775379557015-938546264440',
    '1622560480654-d96214fdc887',
    '1594213114663-d94db9b17125',
    '1601276174812-63280a55656e',
    '1519219788971-8d9797e0928e',
    '1620916297397-a4a5402a3c6c',
    '1738721796993-5f42d9315689',
    '1580618672591-eb180b1a973f',
    '1775993699105-4d18bcac7e54',
    '1602143407151-7111542de6e8',
    '1543002588-bfa74002ed7e',
    '1758279745466-f5f4087a87d6',
    '1784392088142-6c9af385eb98',
    '1763875067516-e947790c74ac',
    '1772986800050-5b1f24d1760a',
    '1591195852468-03a01d1375d6',
    '1522363890879-4bf9c65ee3f8',
    '1751107756601-66fa542b0e3c',
    '1579586337278-3befd40fd17a',
    '1579586337278-3befd40fd17a',
]
let vid = 1
const out = P.map(([name, category, description, specs, vars], i) => ({
    id: i + 1,
    name,
    category,
    description,
    specs,
    image: `https://images.unsplash.com/photo-${PHOTOS[i]}`,
    variants: vars.map(([label, price, quantity], j) => ({
        id: vid++,
        sku: `SC-${String(i + 1).padStart(3, '0')}-${j + 1}`,
        label,
        price,
        quantity,
    })),
}))
writeFileSync(new URL('../shared/products.json', import.meta.url), JSON.stringify(out, null, 1) + '\n')
console.log(out.length, 'products', vid - 1, 'variants')
