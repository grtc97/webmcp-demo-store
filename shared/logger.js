// Minimal scoped logger for the browser and Node. Prefixes every line with [scope]
// so storefront, WebMCP and MCP server messages are easy to tell apart.
export function createLogger(scope) {
    const prefix = `[${scope}]`
    return {
        info: (...details) => console.info(prefix, ...details),
        warn: (...details) => console.warn(prefix, ...details),
        error: (...details) => console.error(prefix, ...details),
    }
}
