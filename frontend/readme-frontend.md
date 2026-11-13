# Frontend

Two React 19 apps built with Vite. Both read shop data only through `shared/` and never touch each other's state.

| App        | Folder        | Purpose                                                      | Build output                                        |
| ---------- | ------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| Storefront | `storefront/` | The website. Also registers the WebMCP tools in the browser. | `dist/storefront/`                                  |
| MCP App    | `mcp-app/`    | In-chat store UI served by the MCP server.                   | `dist/mcp-app/index.html` (one self-contained file) |

## Storefront (`storefront/src`)

- `pages/` one file per route (home, product, cart, checkout, orders, wishlist, component library)
- `components/` store-specific pieces (product card, header, footer, order summary, badges)
- `widgets/` prop-only building blocks that never import the store; the MCP App reuses them
- `services/` `api.js` (async API over the store), `router.js`, `themes.js`, `uiBus.js`
- `webmcp/` `webTools.js` (shared handlers plus page navigation) and `registerWebMcp.js` (browser registration)
- `hooks/`, `utils/`, `styles/`

## MCP App (`mcp-app`)

- `services/bridge.js` talks MCP Apps JSON-RPC over `postMessage` to the host
- `hooks/useStore.js` runs one tool at a time and holds the latest snapshot
- `pages/` one page per snapshot `view` sent by the server
- `preview.html` fake host for local development

The MCP App imports storefront widgets and helpers through the `@storefront` alias, and shop code through `@shared`. These aliases exist only in the Vite configs.

## Commands (run from the project root)

```bash
npm run dev          # storefront at http://localhost:5173
npm run build        # storefront and MCP App
npm run preview:mcp  # MCP App with a fake host
npm test             # unit tests
```

Frontend code has no dependencies of its own; they are all in the root `package.json`.
