import { useEffect, useState } from 'react'

import { store } from '../services/api'

// Re-runs an async api call whenever the shop data changes (UI, agent or another tab).
export function useApi(loader, deps = [], initialValue = null) {
    const [data, setData] = useState(initialValue)
    const [changeCount, setChangeCount] = useState(0)

    useEffect(() => store.subscribe(() => setChangeCount((count) => count + 1)), [])

    useEffect(() => {
        let isActive = true
        loader().then((result) => {
            if (isActive) {
                setData(result)
            }
        })
        return () => {
            isActive = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changeCount, ...deps])

    return data
}
