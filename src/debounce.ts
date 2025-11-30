export function debounce<A extends unknown[]>(
    func: (...args: A) => void,
    debounceTime: number,
): ((...args: A) => void) & { teardown: () => void } {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const debounceFunc = (...args: A): void => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, debounceTime);
    };

    debounceFunc.teardown = () => {
        clearTimeout(timer);
    };

    return debounceFunc;
}

export function debounceByKey<K, A extends unknown[]>(
    func: (...args: A) => void,
    extractKey: (...args: A) => K,
    debounceTime: number,
): ((...args: A) => void) & { teardown: (...args: A) => void; teardownAll: () => void } {
    const map = new Map<K, ReturnType<typeof setTimeout>>();

    const debounceFunc = (...args: A): void => {
        const key = extractKey(...args);
        clearTimeout(map.get(key));
        const timer = setTimeout(() => {
            map.delete(key);
            func(...args);
        }, debounceTime);

        map.set(key, timer);
    };

    debounceFunc.teardown = (...args: A) => {
        const key = extractKey(...args);
        clearTimeout(map.get(key));
        map.delete(key);
    };

    debounceFunc.teardownAll = () => {
        map.forEach((timer) => clearTimeout(timer));
        map.clear();
    };

    return debounceFunc;
}
