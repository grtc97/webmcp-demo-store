import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { createBridge } from '../services/bridge'

// Progress text lives here, keyed by tool name, not in every button.
const PROGRESS_MESSAGES = {
    search_products: 'Searching products…',
    get_product: 'Loading product…',
    check_availability: 'Checking stock…',
    get_cart: 'Loading cart…',
    add_to_cart: 'Adding to cart…',
    set_cart_quantity: 'Updating cart…',
    remove_from_cart: 'Removing item…',
    get_wishlist: 'Loading wishlist…',
    add_to_wishlist: 'Saving…',
    remove_from_wishlist: 'Removing…',
    show_checkout: 'Opening checkout…',
    place_order: 'Placing demo order…',
    get_orders: 'Loading orders…',
}
const DEFAULT_PROGRESS_MESSAGE = 'Working…'
const GENERIC_ERROR_MESSAGE = 'Something went wrong.'

const RunContext = createContext({ run: async () => {}, busy: '' })

export function useRun() {
    return useContext(RunContext)
}

export function RunProvider({ value, children }) {
    return createElement(RunContext.Provider, { value }, children)
}

export function useStore() {
    const [snapshot, setSnapshot] = useState(null)
    const [busy, setBusy] = useState('')
    const [error, setError] = useState('')
    const bridge = useRef(null)
    const isWorking = useRef(false)

    useEffect(() => {
        function handleResult(result) {
            if (result?.structuredContent) {
                setSnapshot(result.structuredContent)
                setError('')
            } else if (result?.isError) {
                setError(result.content?.[0]?.text ?? GENERIC_ERROR_MESSAGE)
            }
        }

        bridge.current = createBridge(handleResult, setError)
        bridge.current.connect().catch((connectError) => setError(connectError.message))
        return () => bridge.current.dispose()
    }, [])

    // One request at a time.
    const run = useCallback(async (name, args = {}) => {
        if (isWorking.current) {
            return
        }
        isWorking.current = true
        setBusy(PROGRESS_MESSAGES[name] ?? DEFAULT_PROGRESS_MESSAGE)
        setError('')
        try {
            await bridge.current.callTool(name, args)
        } catch (callError) {
            setError(callError.message)
        } finally {
            isWorking.current = false
            setBusy('')
        }
    }, [])

    const resize = useCallback((height) => bridge.current?.resize(height), [])

    return { snapshot, busy, error, run, resize }
}
