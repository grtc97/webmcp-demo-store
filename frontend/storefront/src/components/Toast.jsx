export function Toast({ toast }) {
    if (!toast) {
        return null
    }
    return (
        <div className="toast" role="alert">
            {toast.message}
            {toast.action && <a href={'#' + toast.action.to}>{toast.action.label}</a>}
        </div>
    )
}
