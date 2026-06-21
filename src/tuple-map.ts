type TupleMapNode<Keys extends unknown[], V> = Keys extends [infer K, ...infer R]
    ? Map<K, TupleMapNode<R, V>>
    : { value: V };

export class TupleMap<K extends [unknown, ...unknown[]], V> extends Map<K, V> {
    #rootNode: TupleMapNode<K, V> = new Map() as TupleMapNode<K, V>;

    constructor(iterable?: Iterable<readonly [K, V]> | null) {
        super();
        if (iterable) {
            for (const entry of iterable) {
                this.set(entry[0], entry[1]);
            }
        }
    }

    #node(keys: K): { value: V } | undefined {
        let node = this.#rootNode;
        for (const key of keys) {
            if (!node.has(key)) {
                return undefined;
            }
            node = node.get(key)! as TupleMapNode<K, V>;
        }

        return node as { value: V };
    }

    *#entries(node: TupleMapNode<K, V> | { value: V }, keys: unknown[]): Generator<[K, V]> {
        if (!(node instanceof Map)) {
            yield [keys as K, node.value];
        } else {
            for (const child of node.entries()) {
                yield* this.#entries(child[1], keys.concat(child[0]));
            }
        }
    }

    clear(): void {
        this.#rootNode = new Map() as TupleMapNode<K, V>;
    }

    set(keys: K, value: V): this {
        let node = this.#rootNode;
        for (let i = 0; i < keys.length; i++) {
            if (!node.has(keys[i])) {
                if (i === keys.length - 1) {
                    node.set(keys[i], { value });
                } else {
                    node.set(keys[i], new Map() as TupleMapNode<K, V> & { value: V });
                }
            }
            node = node.get(keys[i])! as TupleMapNode<K, V>;
        }
        (node as { value: V }).value = value;

        return this;
    }

    get(keys: K): V | undefined {
        return this.#node(keys)?.value;
    }

    has(keys: K): boolean {
        let node = this.#rootNode;
        for (const key of keys) {
            if (!node.has(key)) {
                return false;
            }
            node = node.get(key)! as TupleMapNode<K, V>;
        }

        return 'value' in node;
    }

    delete(keys: K): boolean {
        let node = this.#rootNode;
        let previousNode = this.#rootNode;
        const entries: [key: unknown, node: TupleMapNode<K, V>][] = [
            [undefined as unknown, this.#rootNode],
        ];
        for (const key of keys) {
            if (!node.has(key)) {
                return false;
            }
            previousNode = node;
            node = node.get(key)! as TupleMapNode<K, V>;
            entries.unshift([key, node]);
        }
        previousNode.delete(entries[0][0]);

        for (let i = 1; i < entries.length - 1; i++) {
            if (entries[i][1].size === 0) {
                entries[i + 1][1].delete(entries[i][0]);
            } else {
                break;
            }
        }

        return true;
    }

    take(keys: K): V | undefined {
        const value = this.get(keys);
        this.delete(keys);
        return value;
    }

    clone(): TupleMap<K, V> {
        const map = new TupleMap<K, V>();
        for (const entry of this.#entries(this.#rootNode, [])) {
            map.set(entry[0], entry[1]);
        }
        return map;
    }

    append(iterable: Iterable<readonly [K, V]>): this {
        for (const entry of iterable) {
            this.set(entry[0], entry[1]);
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

    forEach(callbackfn: (value: V, keys: K, map: Map<K, V>) => void): void {
        for (const entry of this.#entries(this.#rootNode, [])) {
            callbackfn(entry[1], entry[0], this);
        }
    }

    [Symbol.iterator](): MapIterator<[K, V]> {
        return this.#entries(this.#rootNode, []);
    }

    entries(): MapIterator<[K, V]> {
        return this.#entries(this.#rootNode, []);
    }

    *keys(): MapIterator<K> {
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
