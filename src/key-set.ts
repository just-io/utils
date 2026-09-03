export class KeySet<T, K> implements Set<T> {
    #composeKey: (value: T) => K;

    #map = new Map<K, T>();

    constructor(composeKey: (value: T) => K, iterable?: Iterable<T>) {
        this.#composeKey = composeKey;
        if (iterable) {
            for (const value of iterable) {
                this.add(value);
            }
        }
    }

    add(value: T): this {
        const key = this.#composeKey(value);
        this.#map.set(key, value);

        return this;
    }

    clear(): void {
        this.#map.clear();
    }

    delete(value: T): boolean {
        const key = this.#composeKey(value);
        const has = this.#map.has(key);
        if (has) {
            this.#map.delete(key);
        }

        return has;
    }

    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: unknown): void {
        for (const entry of this.#map.entries()) {
            callbackfn.call(thisArg, entry[1], entry[1], this);
        }
    }

    has(value: T): boolean {
        const key = this.#composeKey(value);
        return this.#map.has(key);
    }

    get size(): number {
        return this.#map.size;
    }

    *entries(): SetIterator<[T, T]> {
        for (const entry of this.#map.entries()) {
            yield [entry[1], entry[1]];
        }
    }

    keys(): SetIterator<T> {
        return this.#map.values();
    }

    values(): SetIterator<T> {
        return this.#map.values();
    }

    [Symbol.iterator](): SetIterator<T> {
        return this.values();
    }

    [Symbol.toStringTag]: string = 'KeySet';

    union<U>(other: ReadonlySetLike<U>): Set<T | U> {
        const newSet = new Set<T | U>();
        for (const key of this.keys()) {
            newSet.add(key);
        }
        for (const key of other.keys() as IterableIterator<U>) {
            newSet.add(key);
        }

        return newSet;
    }

    intersection<U>(other: ReadonlySetLike<U>): Set<T & U> {
        const newSet = new Set<T & U>();
        for (const key of this.keys()) {
            if (other.has(key as U & T)) {
                newSet.add(key as U & T);
            }
        }

        return newSet;
    }

    difference<U>(other: ReadonlySetLike<U>): Set<T> {
        const newSet = new Set<T>();
        for (const key of this.keys()) {
            if (!other.has(key as U & T)) {
                newSet.add(key);
            }
        }

        return newSet;
    }

    symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U> {
        const newSet = new Set<T | U>();
        for (const key of this.keys()) {
            if (!other.has(key as T & U)) {
                newSet.add(key);
            }
        }
        const thisSet = new Set(this);
        for (const key of other.keys() as IterableIterator<U>) {
            if (!thisSet.has(key as T & U)) {
                newSet.add(key);
            }
        }

        return newSet;
    }

    isSubsetOf(other: ReadonlySetLike<unknown>): boolean {
        for (const key of this.keys()) {
            if (!other.has(key)) {
                return false;
            }
        }
        return true;
    }

    isSupersetOf(other: ReadonlySetLike<unknown>): boolean {
        const thisSet = new Set(this);
        for (const key of other.keys() as IterableIterator<unknown>) {
            if (!thisSet.has(key as T)) {
                return false;
            }
        }
        return true;
    }

    isDisjointFrom(other: ReadonlySetLike<unknown>): boolean {
        for (const key of this.keys()) {
            if (other.has(key)) {
                return false;
            }
        }
        return true;
    }
}
