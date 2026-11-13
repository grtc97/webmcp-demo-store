// MCP Apps host bridge: JSON-RPC 2.0 over postMessage to the parent window.
const REQUEST_TIMEOUT_MS = 30000
const PROTOCOL_VERSION = '2026-01-26'
const APP_INFO = { name: 'shopchrem-store', version: '1.0.0' }
const UNKNOWN_TOOL_MESSAGE = "This tool is not available. Refresh the connection's tools and open a new chat."

export function getResultText(result) {
    return result?.content?.find((part) => part.type === 'text')?.text ?? 'Tool call failed'
}

function describeHostError(error) {
    return /unknown tool/i.test(error.message) ? UNKNOWN_TOOL_MESSAGE : error.message
}

export function createBridge(onResult, onStatus) {
    const pendingRequests = new Map()
    let nextRequestId = 1

    function post(message) {
        window.parent.postMessage({ jsonrpc: '2.0', ...message }, '*')
    }

    function request(method, params) {
        return new Promise((resolve, reject) => {
            const id = nextRequestId++
            const timer = setTimeout(() => {
                pendingRequests.delete(id)
                reject(new Error(`${method} timed out`))
            }, REQUEST_TIMEOUT_MS)
            pendingRequests.set(id, { resolve, reject, timer })
            post({ id, method, params })
        })
    }

    function settleRequest(message) {
        const { resolve, reject, timer } = pendingRequests.get(message.id)
        clearTimeout(timer)
        pendingRequests.delete(message.id)
        if (message.error) {
            reject(new Error(describeHostError(message.error)))
        } else {
            resolve(message.result)
        }
    }

    function handleMessage(event) {
        const message = event.data
        if (event.source !== window.parent || message?.jsonrpc !== '2.0') {
            return
        }
        if (!message.method && pendingRequests.has(message.id)) {
            settleRequest(message)
        } else if (message.method === 'ui/notifications/tool-result') {
            onResult(message.params)
        } else if (message.method === 'ui/notifications/tool-cancelled') {
            onStatus('The tool call was cancelled.')
        } else if (message.method === 'ui/resource-teardown') {
            post({ id: message.id, result: {} })
        }
    }

    return {
        async connect() {
            window.addEventListener('message', handleMessage)
            if (window.parent === window) {
                return onStatus('Open this store from an MCP host, or use the local preview.')
            }
            await request('ui/initialize', { appInfo: APP_INFO, appCapabilities: {}, protocolVersion: PROTOCOL_VERSION })
            post({ method: 'ui/notifications/initialized' })
        },

        async callTool(name, args = {}) {
            const result = await request('tools/call', { name, arguments: args })
            onResult(result)
            if (result?.isError) {
                throw new Error(getResultText(result))
            }
            return result
        },

        resize(height) {
            post({ method: 'ui/notifications/size-changed', params: { height } })
        },

        dispose() {
            window.removeEventListener('message', handleMessage)
            pendingRequests.forEach(({ timer }) => clearTimeout(timer))
            pendingRequests.clear()
        },
    }
}
