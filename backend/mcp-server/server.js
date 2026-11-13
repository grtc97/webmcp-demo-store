// MCP server: registers the shared tool catalog and the store UI resource,
// and routes every tool call to the actions.
import { RESOURCE_MIME_TYPE, registerAppResource, registerAppTool } from '@modelcontextprotocol/ext-apps/server'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { createMcpToolDefinitions } from '../../shared/tools/definitions.js'
import { toolResult } from './actions.js'

export const RESOURCE_URI = 'ui://shopchrem/store.html'

const SERVER_INFO = { name: 'shopchrem-demo', version: '1.0.0' }
const ALLOWED_IMAGE_DOMAINS = ['https://images.unsplash.com']

function registerStoreResource(server, html) {
    registerAppResource(server, 'ShopChrem store', RESOURCE_URI, { description: 'ShopChrem demo store UI' }, async () => ({
        contents: [
            {
                uri: RESOURCE_URI,
                mimeType: RESOURCE_MIME_TYPE,
                text: html,
                _meta: { ui: { prefersBorder: true, csp: { resourceDomains: ALLOWED_IMAGE_DOMAINS } } },
            },
        ],
    }))
}

export function createMcpServer(actions, html) {
    const server = new McpServer(SERVER_INFO)
    registerStoreResource(server, html)

    for (const { name, title, description, readOnly, inputSchema } of createMcpToolDefinitions(z)) {
        registerAppTool(
            server,
            name,
            {
                title,
                description,
                inputSchema,
                annotations: { readOnlyHint: readOnly, destructiveHint: name === 'place_order', openWorldHint: false },
                _meta: { ui: { resourceUri: RESOURCE_URI } },
            },
            (args) => toolResult(actions, name, args),
        )
    }
    return server
}
