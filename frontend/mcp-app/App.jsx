import { useEffect } from 'react'

import { StoreNav } from './components/StoreNav'
import { RunProvider, useStore } from './hooks/useStore'
import { PAGES, getPageKey } from './pages'

export default function App() {
    const { snapshot, busy, error, run, resize } = useStore()

    // Tell the host how tall the app is, so the iframe fits its content.
    useEffect(() => {
        const observer = new ResizeObserver(() => resize(Math.ceil(document.documentElement.scrollHeight)))
        observer.observe(document.body)
        return () => observer.disconnect()
    }, [resize])

    const Page = snapshot && PAGES[snapshot.view]

    return (
        <RunProvider value={{ run, busy }}>
            <div className="app">
                <div className="app-head">
                    <h1>ShopChrem · Demo store</h1>
                    <span className="app-note">No payment or delivery</span>
                </div>
                {snapshot && <StoreNav snapshot={snapshot} />}
                {busy && (
                    <p className="app-msg" role="status">
                        {busy}
                    </p>
                )}
                {error && (
                    <p className="app-msg err" role="alert">
                        {error}
                    </p>
                )}
                {Page ? <Page key={getPageKey(snapshot)} snapshot={snapshot} /> : !error && <p className="app-msg">Loading the store…</p>}
            </div>
        </RunProvider>
    )
}
