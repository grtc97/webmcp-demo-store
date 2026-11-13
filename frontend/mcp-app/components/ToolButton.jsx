import { useRun } from '../hooks/useStore'

// A w-btn that calls one tool. Disabled while any request is running.
export function ToolButton({ tool, args, tone = 'outline', disabled, children }) {
    const { run, busy } = useRun()
    return (
        <button type="button" className={`w-btn ${tone}`} disabled={disabled || !!busy} onClick={() => run(tool, args)}>
            {children}
        </button>
    )
}
