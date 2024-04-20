import { useContext as useCtx, createContext } from "react"

export function createStrictContext<T>(
    options: {
        errorMessage?: string
    } = {}
) {
    const Context = createContext<T | undefined>(undefined)

    function useContext() {
        const context = useCtx(Context)
        if (context === undefined) {
            throw new Error(options.errorMessage || "useContext must be inside a Provider with a value")
        }
        return context
    }

    return [Context.Provider, useContext] as [React.Provider<T>, () => T]
}