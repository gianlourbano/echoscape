import { ss_delete, ss_save } from "@/utils/secureStore/SStore"

export const invalidateToken = async () => {
    await ss_save("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTM2MDEzNjB9.YLRZxKJCGllmVK1TILiSd7yOajJpcX8f3abvThNaw7M")
    await ss_save("lastUpdate", "2021-02-13T15:00:00.000Z")
}

export const invalidateUser = async () => {
    await ss_delete("username");
    await ss_delete("password");

}


/**
 * Creates a debounced function that delays the invocation of the provided function until after 
 * a specified wait time has elapsed since the last time the debounced function was invoked.
 * If the debounced function is called again before the wait time has elapsed, the previous 
 * invocation is canceled and the wait time is reset.
 *
 * @template T - The type of the function to debounce.
 * @param {T} func - The function to debounce. It can be any function that takes any number of arguments.
 * @param {number} wait - The number of milliseconds to wait before invoking the function.
 * @returns {(...args: Parameters<T>) => Promise<ReturnType<T>>} - Returns a new debounced function that returns a promise.
 *
 * @example
 * // Example usage:
 * const debouncedFunction = debounce((message: string) => {
 *     console.log(message);
 * }, 1000);
 *
 * debouncedFunction("Hello");
 * debouncedFunction("World");
 * // Only "World" will be logged to the console after 1 second, because the second call resets the timer.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: NodeJS.Timeout | null = null;

    //console.log("DEBUG debounce 1")


    return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
        return new Promise((resolve, reject) => {
            const later = () => {
                timeout = null;
                try {
                    const result = func(...args);
                    if (result instanceof Promise) {
                        result.then(resolve).catch(reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            if (timeout) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(later, wait);
        });
    };
}


export const simpleDebounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    //console.log("simple debounce funtion called with ", delay, " milliseconds delay")
    //console.log("debounce timeoutId ", !!timeoutId)
    return (...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            //console.log("funzione dentro debounce chiamata")
            func(...args);
        }, delay);
    };
};