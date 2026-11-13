// One tool catalog with two profiles per tool:
//   mcp: title, description, read-only flag and a Zod schema factory (MCP server)
//   web: description, read-only flag and JSON Schema properties (WebMCP in the browser)
export const toolDefinitions = {
    search_products: {
        mcp: {
            title: 'Search products',
            description:
                'Search the ShopChrem demo store catalog. Returns a page of products (default 10, max 50) with variants, price (INR), quantity and stock status, plus total, offset, limit and has_more. When has_more is true, call again with a larger offset to see the next page. The query matches name, category, description, specs, FAQ and variant labels or SKUs. All filters are optional.',
            readOnly: true,
            schema: ({ z }) => ({
                query: z.string().optional().describe('Free text, e.g. "wireless headphones" or "40 hour battery"'),
                category: z.string().optional().describe('Category name, e.g. Tech & Gadgets'),
                status: z
                    .enum(['in_stock', 'low_stock', 'out_of_stock'])
                    .optional()
                    .describe('Only products having a variant in this status'),
                min_price: z.number().nonnegative().optional().describe('Minimum price in INR'),
                max_price: z.number().nonnegative().optional().describe('Maximum price in INR'),
                sort: z.enum(['relevance', 'price_asc', 'price_desc', 'name']).optional(),
                limit: z.number().int().min(1).max(50).optional().describe('Products per page (default 10, max 50)'),
                offset: z.number().int().min(0).optional().describe('How many matching products to skip, for paging (default 0)'),
            }),
        },
        web: {
            description:
                'Search the ShopChrem catalog. Returns a page of products (default 10, max 50) with variants, price, quantity and stock status (in_stock, low_stock, out_of_stock), plus total, offset, limit and has_more. When has_more is true, call again with a larger offset. All filters are optional.',
            readOnly: true,
            properties: {
                query: {
                    type: 'string',
                    description: 'Free text, e.g. "wireless headphones"',
                },
                category: {
                    type: 'string',
                    description:
                        'One of: Tech & Gadgets, Apparel, Home & Living, Personal Care, Sports & Outdoors, Reading, Toys & Play, Pantry Foods, Office & Stationery',
                },
                status: {
                    type: 'string',
                    enum: ['in_stock', 'low_stock', 'out_of_stock'],
                    description: 'Only products having a variant in this status',
                },
                min_price: {
                    type: 'number',
                },
                max_price: {
                    type: 'number',
                },
                sort: {
                    type: 'string',
                    enum: ['relevance', 'price_asc', 'price_desc', 'name'],
                },
                limit: {
                    type: 'integer',
                    description: 'Products per page (default 10, max 50)',
                },
                offset: {
                    type: 'integer',
                    description: 'How many matching products to skip, for paging (default 0)',
                },
            },
        },
    },
    get_product: {
        mcp: {
            title: 'Get product',
            description: 'Get one product from the ShopChrem demo store with all its variants, specs, FAQ and stock. Prices are in INR.',
            readOnly: true,
            schema: ({ id }) => ({ product_id: id }),
        },
        web: {
            description: 'Get one product with all its variants, specs and stock.',
            readOnly: true,
            properties: {
                product_id: {
                    type: 'integer',
                },
            },
            required: ['product_id'],
        },
    },
    check_availability: {
        mcp: {
            title: 'Check availability',
            description: 'Check live quantity, price (INR) and stock status of one variant in the ShopChrem demo store.',
            readOnly: true,
            schema: ({ id }) => ({ variant_id: id }),
        },
        web: {
            description: 'Check live quantity and stock status of one variant.',
            readOnly: true,
            properties: {
                variant_id: {
                    type: 'integer',
                },
            },
            required: ['variant_id'],
        },
    },
    add_to_wishlist: {
        mcp: {
            title: 'Add to wishlist',
            description: 'Save a variant to the demo store wishlist.',
            readOnly: false,
            schema: ({ id }) => ({ variant_id: id }),
        },
        web: {
            description: 'Save a variant to the wishlist.',
            properties: {
                variant_id: {
                    type: 'integer',
                },
            },
            required: ['variant_id'],
        },
    },
    remove_from_wishlist: {
        mcp: {
            title: 'Remove from wishlist',
            description: 'Remove a variant from the demo store wishlist.',
            readOnly: false,
            schema: ({ id }) => ({ variant_id: id }),
        },
        web: {
            description: 'Remove a variant from the wishlist.',
            properties: {
                variant_id: {
                    type: 'integer',
                },
            },
            required: ['variant_id'],
        },
    },
    get_wishlist: {
        mcp: {
            title: 'Get wishlist',
            description: 'List wishlist items of the demo store with current stock and price (INR).',
            readOnly: true,
            schema: () => ({}),
        },
        web: {
            description: 'List wishlist items with current stock.',
            readOnly: true,
            properties: {},
        },
    },
    add_to_cart: {
        mcp: {
            title: 'Add to cart',
            description: 'Add units of an in-stock variant to the demo store cart. Prices are in INR.',
            readOnly: false,
            schema: ({ id, quantity }) => ({ variant_id: id, quantity }),
        },
        web: {
            description: 'Add units of an in-stock variant to the cart.',
            properties: {
                variant_id: {
                    type: 'integer',
                },
                quantity: {
                    type: 'integer',
                },
            },
            required: ['variant_id', 'quantity'],
        },
    },
    set_cart_quantity: {
        mcp: {
            title: 'Set cart quantity',
            description: 'Set the total quantity of an item already in the demo store cart. Zero removes the item.',
            readOnly: false,
            schema: ({ z, id }) => ({
                variant_id: id,
                quantity: z.number().int().min(0).max(1000).describe('New total quantity (0 removes the item)'),
            }),
        },
        web: {
            description: 'Set the total quantity of an item already in the cart. Zero removes the item.',
            properties: {
                variant_id: {
                    type: 'integer',
                },
                quantity: {
                    type: 'integer',
                    description: 'New total quantity (0 removes the item)',
                },
            },
            required: ['variant_id', 'quantity'],
        },
    },
    get_cart: {
        mcp: {
            title: 'Get cart',
            description: 'Show the demo store cart with line items and total in INR.',
            readOnly: true,
            schema: () => ({}),
        },
        web: {
            description: 'Show the cart with totals.',
            readOnly: true,
            properties: {},
        },
    },
    remove_from_cart: {
        mcp: {
            title: 'Remove from cart',
            description: 'Remove a variant from the demo store cart.',
            readOnly: false,
            schema: ({ id }) => ({ variant_id: id }),
        },
        web: {
            description: 'Remove a variant from the cart.',
            properties: {
                variant_id: {
                    type: 'integer',
                },
            },
            required: ['variant_id'],
        },
    },
    place_order: {
        mcp: {
            title: 'Place demo order',
            description:
                'Place the demo order for the current cart. Only call this after the user has reviewed the cart and total and explicitly confirmed. Ask the user for every missing customer field and never invent details. Set confirmed to true only on that explicit confirmation. No payment is taken, nothing is shipped and no email is sent.',
            readOnly: false,
            schema: ({ z, customer }) => ({
                customer,
                confirmed: z.literal(true).describe('Must be true; only after the user explicitly confirmed this order'),
            }),
        },
        web: {
            description:
                'Place the order for the current cart. ASK THE USER for every field first; never invent customer details. Fails if a field is missing or stock changed.',
            properties: {
                name: {
                    type: 'string',
                    description: 'Full name',
                },
                email: {
                    type: 'string',
                },
                phone: {
                    type: 'string',
                },
                address: {
                    type: 'string',
                    description: 'Street address',
                },
                city: {
                    type: 'string',
                },
                postal_code: {
                    type: 'string',
                },
            },
            required: ['name', 'email', 'phone', 'address', 'city', 'postal_code'],
        },
    },
    show_checkout: {
        mcp: {
            title: 'Show checkout',
            description:
                'Show the checkout review for the demo store cart (items and total in INR) before ordering. Fails if the cart is empty. Does not place an order.',
            readOnly: true,
            schema: () => ({}),
        },
    },
    get_orders: {
        mcp: {
            title: 'Get orders',
            description: 'List orders placed in the demo store, newest first, with totals in INR.',
            readOnly: true,
            schema: () => ({}),
        },
        web: {
            description: 'List placed orders, newest first.',
            readOnly: true,
            properties: {},
        },
    },
}

const MCP_TOOL_ORDER = [
    'search_products',
    'get_product',
    'check_availability',
    'get_cart',
    'add_to_cart',
    'set_cart_quantity',
    'remove_from_cart',
    'get_wishlist',
    'add_to_wishlist',
    'remove_from_wishlist',
    'show_checkout',
    'place_order',
    'get_orders',
]

// Tools for the MCP server. `z` is passed in so the website never bundles Zod.
export function createMcpToolDefinitions(z) {
    const id = z.number().int().positive()
    const quantity = z.number().int().min(1).max(1000)
    const customer = z.object({
        name: z.string().trim().min(1).describe('Full name'),
        email: z.string().trim().email(),
        phone: z.string().trim().min(7),
        address: z.string().trim().min(1).describe('Street address'),
        city: z.string().trim().min(1),
        postal_code: z.string().trim().min(1),
    })
    return MCP_TOOL_ORDER.map((name) => {
        const { title, description, readOnly, schema } = toolDefinitions[name].mcp
        return { name, title, description, readOnly, inputSchema: schema({ z, id, quantity, customer }) }
    })
}

// Tools for the website. Only entries with a `web` profile (show_checkout is MCP only).
export const webToolDefinitions = Object.entries(toolDefinitions)
    .filter(([, definition]) => definition.web)
    .map(([name, definition]) => ({ name, ...definition.web }))
