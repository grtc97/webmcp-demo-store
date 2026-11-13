function describeWebMcpStatus(webMcpStatus, toolNames) {
    if (webMcpStatus.supported) {
        return `via ${webMcpStatus.where}\n` + toolNames.join('\n')
    }
    return webMcpStatus.error || 'document.modelContext not found in this browser'
}

export function SiteFooter({ webMcpStatus, toolNames, onReset }) {
    return (
        <footer className="foot">
            <div>
                <strong>ShopChrem</strong>
                <span>A demo store for the agentic commerce workshop. No real orders or payments. Photos from Unsplash.</span>
            </div>
            <div className="footlinks">
                <a href="#/widgets">Component library</a>
                <button onClick={onReset}>Reset demo data</button>
                <span
                    className={'pill ' + (webMcpStatus.supported ? 'good' : 'warn')}
                    title={describeWebMcpStatus(webMcpStatus, toolNames)}
                >
                    WebMCP: {webMcpStatus.supported ? `${webMcpStatus.count} tools live` : 'not detected'}
                </span>
            </div>
        </footer>
    )
}
