export type Subscriber<E extends unknown[]> = (...args: E) => void;

export interface Notifiable<E extends unknown[]> {
    subscribe(subscriber: Subscriber<E>, options?: { once?: boolean }): this;
    unsubscribe(subscriber: Subscriber<E>): boolean;
}

export class Notifier<E extends unknown[]> implements Notifiable<E> {
    #subscribers: Set<Subscriber<E>> = new Set();

    #onceSubscribers: WeakSet<Subscriber<E>> = new WeakSet();

    getSubscribers(): Set<Subscriber<E>> {
        return this.#subscribers;
    }

    subscribe(subscriber: Subscriber<E>, options?: { once?: boolean }): this {
        this.#subscribers.add(subscriber);
        if (options?.once) {
            this.#onceSubscribers.add(subscriber);
        }
        return this;
    }

    unsubscribe(subscriber: Subscriber<E>): boolean {
        this.#onceSubscribers.delete(subscriber);
        return this.#subscribers.delete(subscriber);
    }

    notify(...args: E): void {
        const unsubscribers = new Set<Subscriber<E>>();
        this.#subscribers.forEach((subscriber) => {
            try {
                subscriber(...args);
            } catch {}
            if (this.#onceSubscribers.has(subscriber)) {
                unsubscribers.add(subscriber);
            }
        });
        for (const subscriber of unsubscribers) {
            this.unsubscribe(subscriber);
        }
    }

    unsubscribeAll(): void {
        this.#subscribers = new Set();
        this.#onceSubscribers = new WeakSet();
    }
}

export type EventMap = Record<string, unknown[]>;

export interface Eventable<E extends EventMap> {
    on<K extends keyof E>(event: K, subscriber: Subscriber<E[K]>): this;
    once<K extends keyof E>(event: K, subscriber: Subscriber<E[K]>): this;
    off<K extends keyof E>(event: K, subscriber: Subscriber<E[K]>): boolean;
}

export type EventTuple<E extends EventMap> = {
    [K in keyof E]: [K, ...E[K]];
}[keyof E];

export class EventStore<E extends EventMap> {
    #eventEmitter: EventEmitter<E>;

    #eventTuples: EventTuple<E>[] = [];

    constructor(eventEmitter: EventEmitter<E>) {
        this.#eventEmitter = eventEmitter;
    }

    add<K extends keyof E>(event: K, ...args: E[K]): void;
    add(...eventTuple: EventTuple<E>): void;
    add<K extends keyof E>(event: K, ...args: E[K]): void {
        this.#eventTuples.push([event, ...args]);
    }

    emit(): void {
        for (const eventTuple of this.#eventTuples) {
            this.#eventEmitter.emit(...eventTuple);
        }
        this.#eventTuples = [];
    }

    consume(eventStore: EventStore<E>): void {
        this.#eventTuples.push(...eventStore.#eventTuples);
        eventStore.#eventTuples = [];
    }

    clean(): void {
        this.#eventTuples = [];
    }
}

export class EventEmitter<E extends EventMap> implements Eventable<E> {
    #subscribers: {
        [K in keyof E]?: Set<Subscriber<E[K]>>;
    } = {};

    #onceSubscribers: {
        [K in keyof E]?: WeakSet<Subscriber<E[K]>>;
    } = {};

    getSubscribers<K extends keyof E>(event: K): Set<Subscriber<E[K]>> {
        if (!this.#subscribers[event]) {
            this.#subscribers[event] = new Set();
            this.#onceSubscribers[event] = new WeakSet();
        }
        const subscribers = this.#subscribers[event]!;
        return subscribers;
    }

    on<K extends keyof E>(event: K, subscriber: Subscriber<E[K]>): this {
        const subscribers = this.getSubscribers(event);
        subscribers.add(subscriber);
        return this;
    }

    once<K extends keyof E>(event: K, subscriber: Subscriber<E[K]>): this {
        this.on(event, subscriber);
        this.#onceSubscribers[event]!.add(subscriber);
        return this;
    }

    off<K extends keyof E>(event: K, subscriber: Subscriber<E[K]>): boolean {
        this.#onceSubscribers[event]?.delete(subscriber);
        return this.getSubscribers(event).delete(subscriber);
    }

    emit<K extends keyof E>(event: K, ...args: E[K]): void;
    emit(...eventTuple: EventTuple<E>): void;
    emit<K extends keyof E>(event: K, ...args: E[K]): void {
        if (!this.#subscribers[event]) {
            return;
        }
        const unsubscribers = new Set<Subscriber<E[K]>>();
        this.getSubscribers(event).forEach((subscriber) => {
            try {
                subscriber(...args);
            } catch {}
            if (this.#onceSubscribers[event]?.has(subscriber)) {
                unsubscribers.add(subscriber);
            }
        });
        for (const subscriber of unsubscribers) {
            this.off(event, subscriber);
        }
    }

    unsubscribeAll(): void;
    unsubscribeAll<K extends keyof E>(event: K): void;
    unsubscribeAll<K extends keyof E>(event?: K): void {
        if (event !== undefined) {
            this.#subscribers[event] = new Set();
            this.#onceSubscribers[event] = new WeakSet();
        } else {
            this.#subscribers = {};
            this.#onceSubscribers = {};
        }
    }

    makeStore(): EventStore<E> {
        return new EventStore(this);
    }
}
