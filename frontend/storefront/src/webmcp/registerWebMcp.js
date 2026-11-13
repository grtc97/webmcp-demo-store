// WebMCP browser registration. Tool contracts and commerce handlers are shared;
// this file only finds the browser's modelContext and registers the tools with it.
import { createLogger } from '@shared/logger.js'

import { store } from '../services/api'
import { showInUI } from '../services/uiBus'
import { createWebTools } from './webTools'

const RETRY_INTERVAL_MS = 500
const MAX_RETRIES = 30 // ~15 seconds
const logger = createLogger('WebMCP')

export const tools = createWebTools(store, showInUI)

function successResult(data) {
    return { content: [{ type: 'text', text: JSON.stringify(data) }] }
}

function errorResult(error) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true }
}

function describeError(error) {
    return String(error?.message || error)
}

function findModelContext() {
    // Current spec: document.modelContext. Older drafts / early Chrome: navigator.modelContext.
    if (document.modelContext) {
        return { context: document.modelContext, where: 'document.modelContext' }
    }
    if (navigator.modelContext) {
        return { context: navigator.modelContext, where: 'navigator.modelContext' }
    }
    return null
}

function buildToolRegistrations() {
    return tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: { type: 'object', properties: tool.properties, required: tool.required || [] },
        annotations: { readOnlyHint: !!tool.readOnly },
        execute: async (input) => {
            try {
                return successResult(await tool.run(input || {}))
            } catch (error) {
                return errorResult(error)
            }
        },
    }))
}

// registerTool may throw (older builds) or return a rejected Promise (newer builds),
// so every call is awaited inside try/catch.
async function registerEachTool(context, registrations) {
    let count = 0
    let lastError = ''
    for (const registration of registrations) {
        try {
            await context.registerTool(registration)
            count++
        } catch (error) {
            // Already registered (hot reload / re-run) counts as present.
            if (/already|duplicate/i.test(String(error?.message))) {
                count++
            } else {
                lastError = `${registration.name}: ${describeError(error)}`
                logger.warn('registerTool failed', registration.name, error)
            }
        }
    }
    return { count, lastError }
}

async function registerTools({ context, where }) {
    const registrations = buildToolRegistrations()

    if (typeof context.registerTool === 'function') {
        const { count, lastError } = await registerEachTool(context, registrations)
        return { supported: count > 0, count, where, error: lastError }
    }
    if (typeof context.provideContext === 'function') {
        await context.provideContext({ tools: registrations })
        return { supported: true, count: registrations.length, where: `${where} (provideContext)`, error: '' }
    }
    return { supported: false, count: 0, where, error: 'modelContext found but has no registerTool/provideContext' }
}

// Handy in DevTools even when the browser has no WebMCP:
//   await storefrontTools.search_products({ query: 'headphones' })
function exposeToolsForDevTools() {
    window.storefrontTools = Object.fromEntries(
        tools.map((tool) => [tool.name, (args = {}) => tool.run(args).then(successResult, errorResult)]),
    )
}

// Starts WebMCP. The agent browser may inject modelContext a moment after page load,
// so keep looking for ~15 s. onStatus fires whenever the status changes.
export function startWebMCP(onStatus) {
    exposeToolsForDevTools()
    let isStopped = false
    let retryCount = 0

    // Returns true when there is nothing left to try.
    async function attemptRegistration() {
        if (isStopped) {
            return true
        }
        const found = findModelContext()
        if (!found) {
            return false
        }
        try {
            const status = await registerTools(found)
            logger.info(status.supported ? `registered ${status.count} tools via ${status.where}` : 'not registered', status.error || '')
            onStatus(status)
            return status.supported
        } catch (error) {
            logger.warn('registration error', error)
            onStatus({ supported: false, count: 0, where: found.where, error: describeError(error) })
            return true
        }
    }

    const retryTimer = setInterval(async () => {
        retryCount++
        if ((await attemptRegistration()) || retryCount > MAX_RETRIES) {
            clearInterval(retryTimer)
        }
    }, RETRY_INTERVAL_MS)

    attemptRegistration().then((isDone) => {
        if (isDone) {
            clearInterval(retryTimer)
        } else if (!findModelContext()) {
            logger.info('document.modelContext / navigator.modelContext not found (yet)')
        }
    })

    return () => {
        isStopped = true
        clearInterval(retryTimer)
    }
}
