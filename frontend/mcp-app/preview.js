// Fake MCP host: answers the app's JSON-RPC and runs tools on the real actions.
import { createActions, toolResult } from '../../backend/mcp-server/actions.js'

const HOST_INFO = { name: 'preview', version: '1.0.0' }
const CHAT_REQUESTS = {
    products: 'search_products',
    cart: 'get_cart',
    wishlist: 'get_wishlist',
    checkout: 'show_checkout',
    orders: 'get_orders',
}

const actions = createActions()
const frame = document.getElementById('app')
const chatSelect = document.getElementById('chat')

function sendToApp(message) {
    frame.contentWindow.postMessage({ jsonrpc: '2.0', ...message }, '*')
}

async function showResult(name, args = {}) {
    sendToApp({ method: 'ui/notifications/tool-result', params: await toolResult(actions, name, args) })
}

async function handleAppMessage({ source, data: message }) {
    if (source !== frame.contentWindow || message?.jsonrpc !== '2.0') {
        return
    }
    if (message.method === 'ui/initialize') {
        const result = { protocolVersion: message.params.protocolVersion, hostInfo: HOST_INFO, hostCapabilities: {}, hostContext: {} }
        sendToApp({ id: message.id, result })
    } else if (message.method === 'ui/notifications/initialized') {
        showResult('search_products')
    } else if (message.method === 'tools/call') {
        sendToApp({ id: message.id, result: await toolResult(actions, message.params.name, message.params.arguments) })
    } else if (message.method === 'ui/notifications/size-changed') {
        frame.style.height = `${message.params.height}px`
    }
}

window.addEventListener('message', handleAppMessage)

chatSelect.addEventListener('change', () => {
    const toolName = CHAT_REQUESTS[chatSelect.value]
    if (toolName) {
        showResult(toolName)
    }
    chatSelect.value = ''
})
