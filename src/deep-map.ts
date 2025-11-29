type DeepMapNode<T> = {
    children: Map<unknown, DeepMapNode<T>>;
    value?: T;
};

export class DeepMap<K, V> {
    #rootNode: DeepMapNode<V> = {
        children: new Map(),
    };

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
        node.value = value;

        return this;
    }

    get(keys: K[]): V | undefined {
        let node = this.#rootNode;
        for (const key of keys) {
            if (!node.children.has(key)) {
                return undefined;
            }
            node = node.children.get(key)!;
        }

        return node.value;
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
        const entries: [key: unknown, node: DeepMapNode<V>][] = [[undefined, this.#rootNode]];
        for (const key of keys) {
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

    extract(keys: K[]): V | undefined {
        const value = this.get(keys);
        this.delete(keys);
        return value;
    }
}
