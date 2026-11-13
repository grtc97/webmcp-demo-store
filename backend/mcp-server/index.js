// HTTP entry point. One demo shop is shared by every client of this process.
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

import { createLogger } from '../../shared/logger.js'
import { createActions } from './actions.js'
import { createMcpServer } from './server.js'

const HOST = process.env.MCP_HOST || '127.0.0.1'
const PORT = Number(process.env.MCP_PORT) || 3001
const INTERNAL_ERROR_RESPONSE = { jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null }

const logger = createLogger('MCP server')
const actions = createActions()
const STORE_HTML_URL = new URL('../../dist/mcp-app/index.html', import.meta.url)

// Built by `npm run build:mcp`; read once at startup.
function readStoreHtml() {
    try {
        return readFileSync(STORE_HTML_URL, 'utf-8')
    } catch (error) {
        logger.error('dist/mcp-app/index.html is missing. Run `npm run build:mcp` first.', error.message)
        process.exit(1)
    }
}

const storeHtml = readStoreHtml()

function sendJson(response, status, body, headers = {}) {
    response.writeHead(status, { 'Content-Type': 'application/json', ...headers })
    response.end(JSON.stringify(body))
}

// Stateless Streamable HTTP: a new transport and server for every request.
async function handleMcpRequest(request, response) {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
    const server = createMcpServer(actions, storeHtml)
    response.on('close', () => {
        transport.close()
        server.close()
    })

    try {
        await server.connect(transport)
        await transport.handleRequest(request, response)
    } catch (error) {
        logger.error('Request failed', error)
        if (!response.headersSent) {
            sendJson(response, 500, INTERNAL_ERROR_RESPONSE)
        }
    }
}

const httpServer = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://localhost')

    if (pathname === '/health' && request.method === 'GET') {
        return sendJson(response, 200, { ok: true, name: 'shopchrem-demo' })
    }
    if (pathname !== '/mcp') {
        return sendJson(response, 404, { error: 'Not found' })
    }
    if (request.headers.origin) {
        return sendJson(response, 403, { error: 'Browser origins are not allowed' })
    }
    if (request.method !== 'POST') {
        return sendJson(response, 405, { error: 'Stateless MCP accepts POST requests.' }, { Allow: 'POST' })
    }

    return handleMcpRequest(request, response)
})

httpServer.listen(PORT, HOST, () => logger.info(`ShopChrem MCP server: http://${HOST}:${PORT}/mcp`))
process.on('SIGINT', () => httpServer.close(() => process.exit(0)))
