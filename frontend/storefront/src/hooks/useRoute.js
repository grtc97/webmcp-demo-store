import { useEffect, useState } from 'react'

import { parseRoute, readHashPath } from '../services/router'

export function useRoute() {
    const [path, setPath] = useState(readHashPath)

    useEffect(() => {
        const handleHashChange = () => setPath(readHashPath())
        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [])

    return parseRoute(path)
}
