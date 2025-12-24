type DeepMapNode<K, V> = {
    children: Map<K, DeepMapNode<K, V>>;
    value?: V;
};

export class DeepMap<K, V> extends Map<K[], V> {
    #rootNode: DeepMapNode<K, V> = {
        children: new Map(),
    };

    constructor(iterable?: Iterable<readonly [K[], V]> | null) {
        super();
        if (iterable) {
            for (const entry of iterable) {
                this.set(entry[0], entry[1]);
            }
        }
    }

    #node(keys: K[] | K): DeepMapNode<K, V> | undefined {
        let node = this.#rootNode;
        for (const key of (Array.isArray(keys) ? keys : [keys])) {
            if (!node.children.has(key)) {
                return undefined;
            }
            node = node.children.get(key)!;
        }

        return node;
    }

    *#entries(node: DeepMapNode<K, V>, key: K[]): Generator<[K[], V]> {
        if (node.value !== undefined) {
            yield [key, node.value];
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

    set(keys: K[] | K, value: V): this {
        let node = this.#rootNode;
        for (const key of (Array.isArray(keys) ? keys : [keys])) {
            if (!node.children.has(key)) {
                node.children.set(key, {
                    children: new Map(),
                });
            }
            node = node.children.get(key)!;
        }
        node.value = value;

        return this;
    }

    get(keys: K[] | K): V | undefined {
        return this.#node(keys)?.value;
    }

    has(keys: K[] | K): boolean {
        let node = this.#rootNode;
        for (const key of (Array.isArray(keys) ? keys : [keys])) {
            if (!node.children.has(key)) {
                return false;
            }
            node = node.children.get(key)!;
        }

        return node.value !== undefined;
    }

    delete(keys: K[] | K): boolean {
        let node = this.#rootNode;
        const entries: [key: K, node: DeepMapNode<K, V>][] = [[undefined as K, this.#rootNode]];
        for (const key of (Array.isArray(keys) ? keys : [keys])) {
            if (!node.children.has(key)) {
                return false;
            }
            node = node.children.get(key)!;
            entries.unshift([key, node]);
        }
        node.value = undefined;

        for (let i = 0; i < entries.length - 1; i++) {
            if (entries[i][1].children.size === 0) {
                entries[i + 1][1].children.delete(entries[i][0]);
            } else {
                break;
            }
        }

        return true;
    }

    take(keys: K[] | K): V | undefined {
        const value = this.get(keys);
        this.delete(keys);
        return value;
    }

    clone(keys: K[] | K): DeepMap<K, V> {
        const node = this.#node(keys);
        const map = new DeepMap<K, V>();
        if (node) {
            for (const entry of this.#entries(node, [])) {
                map.set(entry[0], entry[1]);
            }
        }
        return map;
    }

    extract(keys: K[] | K): DeepMap<K, V> {
        const node = this.#node(keys);
        const map = new DeepMap<K, V>();
        if (node) {
            for (const entry of this.#entries(node, [])) {
                map.set(entry[0], entry[1]);
            }
            if (node.value !== undefined) {
                map.set([], node.value);
            }
            node.children = new Map();
            node.value = undefined;
        }
        return map;
    }

    append(keys: K[] | K, iterable: Iterable<readonly [K[], V]>): this {
        for (const entry of iterable) {
            this.set((Array.isArray(keys) ? keys : [keys]).concat(entry[0]), entry[1]);
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

    forEach(callbackfn: (value: V, key: K[], map: Map<K[], V>) => void): void {
        for (const entry of this.#entries(this.#rootNode, [])) {
            callbackfn(entry[1], entry[0], this);
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
}
