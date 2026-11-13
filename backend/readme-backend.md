# Backend

A single Node process, `mcp-server/`, that exposes the shop to MCP clients (for example ChatGPT or Claude). It has no database and no external services.

## Files

- `mcp-server/index.js` HTTP entry point: `GET /health`, `POST /mcp`, everything else is refused
- `mcp-server/server.js` registers the shared tool catalog and the store UI resource with the MCP SDK
- `mcp-server/actions.js` runs a shared handler, returns a snapshot for the MCP App, and turns errors into `isError` results

## Behavior

- Stateless Streamable HTTP: a new transport and server for every request.
- One in-memory shop is shared by every client of the process. A restart resets it.
- Requests with a browser `Origin` header get 403; non-POST requests to `/mcp` get 405.
- `place_order` needs `confirmed: true`, and customer details are never returned to the chat.
- The server reads `dist/mcp-app/index.html` at startup and exits with a clear message if it is missing.

## Settings

| Variable   | Default     | Meaning                                                       |
| ---------- | ----------- | ------------------------------------------------------------- |
| `MCP_HOST` | `127.0.0.1` | Address to bind. `0.0.0.0` exposes the server to the network. |
| `MCP_PORT` | `3001`      | Port to listen on.                                            |

## Run (from the project root)

```bash
npm run build:mcp   # builds the MCP App first
npm run start:mcp   # http://127.0.0.1:3001/mcp
npm test            # includes backend/mcp-server/actions.test.js
```

There is no authentication. Do not expose this server publicly without adding it.

Shop rules and the tool catalog live in `shared/`, not here. The backend has no separate requirements file; dependencies are in the root `package.json`.
