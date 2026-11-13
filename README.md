# ShopChrem

[![CI](https://github.com/grtc97/webmcp-demo-store/actions/workflows/ci.yml/badge.svg)](https://github.com/grtc97/webmcp-demo-store/actions/workflows/ci.yml)

A demo online store that shows how a normal website can be made usable by AI agents. The same shop logic is exposed three ways: **WebMCP** tools registered by the web page, an **MCP server** with an in-chat **MCP App** UI, and an **AEO** (Answer Engine Optimization) lesson about product data quality.

There is no database, no REST API, no payment service and no API keys. The whole shop is one JSON document seeded from `shared/products.json`. In the browser it lives in `localStorage`; in the Node server it lives in memory.

## Problem statement

AI assistants usually operate a website by reading the page and clicking around, which is slow and fragile. ShopChrem gives agents a direct, typed interface to the shop instead, and lets a presenter watch the agent work:

| Door                 | What it is                                                                                                                                                                | Runs in                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| WebMCP               | The page registers 12 tools with the browser (`document.modelContext`, falling back to `navigator.modelContext`). A browser-based agent calls them while the page reacts. | The user's browser tab      |
| MCP server + MCP App | A Node HTTP server speaks the Model Context Protocol on `/mcp` with 13 tools, and serves a small React store UI that chat clients render inline.                          | A local Node process        |
| AEO                  | Two near-identical smartwatches differ only in metadata quality. One is always found by the search tool, the other is not.                                                | Same `search_products` tool |

## Architecture

All business rules live in one place. Every interface is a thin adapter on top of it.

```text
shared/products.json     seed catalog (29 products, 9 categories)
        |
shared/store.js          pure JS shop rules: search, stock, wishlist, cart, orders
        |
shared/tools/            one tool catalog ("web" and "mcp" profiles) and handlers
        |
        +-- frontend/storefront/   website (React) + WebMCP adapter (adds page navigation)
        +-- backend/mcp-server/    MCP adapter (adds a view snapshot to every result)
                |
                +-- frontend/mcp-app/   in-chat UI that renders those snapshots
```

Project layout:

```text
.
├── backend/mcp-server/      HTTP server, tool registration, actions
├── frontend/
│   ├── storefront/          website (Vite + React 19)
│   └── mcp-app/             MCP App (built into one self-contained HTML file)
├── shared/                  store rules, tool catalog, seed data, logger
├── docs/                    workshop prompts (WebMCP, MCP server, AEO demo)
└── scripts/                 one-off seed generator
```

## Tools

- Discover: `search_products`, `get_product`, `check_availability`
- Wishlist: `get_wishlist`, `add_to_wishlist`, `remove_from_wishlist`
- Cart: `get_cart`, `add_to_cart`, `set_cart_quantity`, `remove_from_cart`
- Buy: `place_order`, `get_orders`
- MCP server only: `show_checkout`

Safety rules are part of the tool descriptions and schemas. `place_order` must ask the user for every field, never invent details, and (on the MCP server) requires `confirmed: true` and is flagged destructive. There are no tools that edit products, stock or the catalog, and the MCP server never returns customer details.

## Models used

None. ShopChrem contains no model and calls no model API. It is the _tool provider_; the agent (for example ChatGPT or Claude) is whatever client you connect to it.

## Evaluation approach

- Unit tests (Node's built-in test runner) cover the shop rules, the tool catalog and the MCP actions, including the safety rules above.
- The AEO pair of smartwatches is a built-in evaluation of search quality: the well-described product should be returned for specific questions, the vague one should not.
- The docs include manual demo scripts to check agent behavior end to end.

## Run it

Requires Node 22.12 or newer.

```bash
npm install
npm run dev          # website at http://localhost:5173
npm test             # run the tests
npm run build        # build the website and the MCP App
npm run start:mcp    # MCP server at http://127.0.0.1:3001/mcp (build first)
npm run dev:mcp      # rebuild the MCP App and restart the server on change
npm run preview:mcp  # preview the MCP App without an MCP host
npm run format       # format all files with Prettier
```

Open the website with `?reset` (for example `http://localhost:5173/?reset`) or use **Reset demo data** in the footer to restore the seed data.

### Use the MCP server from a chat client

1. `npm run build:mcp`, then `npm run start:mcp`.
2. Expose port 3001 over HTTPS with a tunnel tool such as ngrok.
3. Add the HTTPS `/mcp` URL as a custom connector in your chat client.

Server settings: `MCP_HOST` (default `127.0.0.1`) and `MCP_PORT` (default `3001`). Requests that carry a browser `Origin` header are refused.

### Use WebMCP

Open the website in a browser that exposes `document.modelContext` or `navigator.modelContext`. The footer shows **WebMCP: N tools live** when the tools were accepted, or **not detected** otherwise. Without WebMCP you can still call any tool from the browser console:

```js
await storefrontTools.search_products({ query: 'headphones' })
```

Plain Chrome needs the `chrome://flags/#enable-webmcp-testing` flag and a relaunch. Availability in other browsers and chat products changes over time, so check the vendor's current documentation.

## Continuous integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `main` and on pull requests. It installs dependencies with `npm ci`, then checks formatting, runs the tests and builds both apps, and confirms the MCP App is a single file. Run the same checks locally with `npm run format:check`, `npm test` and `npm run build`.

## Deployment

ShopChrem is a demo and is not hardened for production. The storefront builds to static files in `dist/storefront` and can be hosted on any static host. The MCP server is a single Node process with in-memory state, so every client of the process shares one shop and data resets on restart.

## Data and photos

The website stores data in the browser under the key `shopchrem:v2`, per origin (host and port). Product photos are free-to-use [Unsplash](https://unsplash.com) images loaded by URL, so an internet connection is needed. A neutral placeholder is shown if a photo fails to load.

## Tech stack

React 19, Vite 6, lucide-react, Poppins (`@fontsource/poppins`), `@modelcontextprotocol/sdk`, `@modelcontextprotocol/ext-apps`, Zod, Node 22.12+. Prettier is the only dev tool for formatting.

## Workshop material

The `docs/` folder holds staged prompts used in a workshop to build the WebMCP layer, the MCP server and the AEO demo. They describe the original single-folder layout, so file paths in them differ from this repository.
