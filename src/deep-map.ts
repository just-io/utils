type DeepMapNode<K, V> = {
    children: Map<K, DeepMapNode<K, V>>;
    value?: { value: V };
};

export class DeepMap<K, V> implements Map<K[], V> {
    #rootNode: DeepMapNode<K, V> = {
        children: new Map(),
    };

    constructor(iterable?: Iterable<readonly [K[], V]> | null) {
        if (iterable) {
            for (const entry of iterable) {
                this.set(entry[0], entry[1]);
            }
        }
    }

    #node(keys: K[]): DeepMapNode<K, V> | undefined {
        let node = this.#rootNode;
        for (const key of keys) {
            if (!node.children.has(key)) {
                return undefined;
            }
            node = node.children.get(key)!;
        }

        return node;
    }

    *#entries(node: DeepMapNode<K, V>, key: K[]): Generator<[K[], V]> {
        if (node.value !== undefined) {
            yield [key.slice(), node.value.value];
        }
        for (const child of node.children) {
            yield* this.#entries(child[1], key.concat(child[0]));
        }
    }

    clear(): void {
        this.#rootNode = {
            children: new Map(),
        };
    }

    set(keys: K[], value: V): this {
        let node = this.#rootNode;
        for (const key of keys) {
            if (!node.children.has(key)) {
                node.children.set(key, {
                    children: new Map(),
                });
            }
            node = node.children.get(key)!;
        }
        node.value = { value };

        return this;
    }

    get(keys: K[]): V | undefined {
        return this.#node(keys)?.value?.value;
    }

    has(keys: K[]): boolean {
        let node = this.#rootNode;
        for (const key of keys) {
            if (!node.children.has(key)) {
                return false;
            }
            node = node.children.get(key)!;
        }

        return node.value !== undefined;
    }

    delete(keys: K[]): boolean {
        let node = this.#rootNode;
        const entries: [key: K, node: DeepMapNode<K, V>][] = [[undefined as K, this.#rootNode]];
        for (const key of keys) {
            if (!node.children.has(key)) {
                return false;
            }
            node = node.children.get(key)!;
            entries.unshift([key, node]);
        }
        if (node.value === undefined) {
            return false;
        }
        node.value = undefined;

        for (let i = 0; i < entries.length - 1; i++) {
            if (entries[i][1].children.size === 0 && entries[i][1].value === undefined) {
                entries[i + 1][1].children.delete(entries[i][0]);
            } else {
                break;
            }
        }

        return true;
    }

    take(keys: K[]): V | undefined {
        const value = this.get(keys);
        this.delete(keys);
        return value;
    }

    clone(keys: K[]): DeepMap<K, V> {
        const node = this.#node(keys);
        const map = new DeepMap<K, V>();
        if (node) {
            for (const entry of this.#entries(node, [])) {
                map.set(entry[0], entry[1]);
            }
        }
        return map;
    }

    extract(keys: K[]): DeepMap<K, V> {
        const node = this.#node(keys);
        const map = new DeepMap<K, V>();
        if (node) {
            for (const entry of this.#entries(node, [])) {
                map.set(entry[0], entry[1]);
            }
            node.children = new Map();
            node.value = undefined;
        }
        return map;
    }

    append(keys: K[], iterable: Iterable<readonly [K[], V]>): this {
        for (const entry of iterable) {
            this.set(keys.concat(entry[0]), entry[1]);
        }
        return this;
    }

    get size(): number {
        let count = 0;

        for (const {} of this.#entries(this.#rootNode, [])) {
            count++;
        }

        return count;
    }

    forEach(callbackfn: (value: V, key: K[], map: Map<K[], V>) => void, thisArg?: unknown): void {
        for (const entry of this.#entries(this.#rootNode, [])) {
            callbackfn.call(thisArg, entry[1], entry[0], this);
        }
    }

    [Symbol.iterator](): MapIterator<[K[], V]> {
        return this.#entries(this.#rootNode, []);
    }

    entries(): MapIterator<[K[], V]> {
        return this.#entries(this.#rootNode, []);
    }

    *keys(): MapIterator<K[]> {
        for (const entry of this.#entries(this.#rootNode, [])) {
            yield entry[0];
        }
    }

    *values(): MapIterator<V> {
        for (const entry of this.#entries(this.#rootNode, [])) {
            yield entry[1];
        }
    }

    [Symbol.toStringTag]: string = 'DeepMap';

    getOrInsert(key: K[], defaultValue: V): V {
        if (this.has(key)) {
            return this.get(key)!;
        }
        this.set(key, defaultValue);

        return defaultValue;
    }

    getOrInsertComputed(key: K[], callback: (key: K[]) => V): V {
        if (this.has(key)) {
            return this.get(key)!;
        }
        const value = callback(key);
        this.set(key, value);

        return value;
    }
}
