// Lets WebMCP tools steer the visible UI (switch view, set filters) so people
// can watch the agent work.
const UI_EVENT = 'ui'
const bus = new EventTarget()

export function showInUI(detail) {
    bus.dispatchEvent(new CustomEvent(UI_EVENT, { detail }))
}

export function onUIRequest(listener) {
    const handleEvent = (event) => listener(event.detail)
    bus.addEventListener(UI_EVENT, handleEvent)
    return () => bus.removeEventListener(UI_EVENT, handleEvent)
}
