export function memo<A extends unknown[]>(
    func: (...args: A) => void,
    extractMemoValues: (...args: A) => unknown[],
    onlyChanges: boolean = false,
): (...args: A) => void {
    let oldMemoValues: unknown[] | undefined;

    return (...args: A): void => {
        const memoValues = extractMemoValues(...args);
        if (!oldMemoValues) {
            if (!onlyChanges) {
                func(...args);
            }
            oldMemoValues = memoValues;
        } else if (
            oldMemoValues.length !== memoValues.length ||
            oldMemoValues.some((value, i) => value !== memoValues[i])
        ) {
            func(...args);
            oldMemoValues = memoValues;
        }
    };
}

export function memoByKey<K, A extends unknown[]>(
    func: (...args: A) => void,
    extractKey: (...args: A) => K,
    extractMemoValues: (...args: A) => unknown[],
    onlyChanges: boolean = false,
): (...args: A) => void {
    const map = new Map<K, unknown[]>();

    return (...args: A): void => {
        const key = extractKey(...args);
        const oldMemoValues = map.get(key);
        const memoValues = extractMemoValues(...args);
        if (!oldMemoValues) {
            if (!onlyChanges) {
                func(...args);
            }
            map.set(key, memoValues);
        } else if (
            oldMemoValues.length !== memoValues.length ||
            oldMemoValues.some((value, i) => value !== memoValues[i])
        ) {
            func(...args);
            map.set(key, memoValues);
        }
    };
}
