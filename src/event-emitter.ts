export type Subscriber<E extends unknown[]> = (...args: E) => void;

export interface Notifiable<E extends unknown[]> {
    subscribe(subscriber: Subscriber<E>, options?: { once?: boolean }): this;
    unsubscribe(subscriber: Subscriber<E>): boolean;
}

export class Notifier<E extends unknown[]> implements Notifiable<E> {
    #subscribers: Set<Subscriber<E>> = new Set();

    #onceSubscribers: WeakSet<Subscriber<E>> = new WeakSet();

    getSuscribers(): Set<Subscriber<E>> {
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
        this.#subscribers.forEach((subscriber) => {
            subscriber(...args);
            if (this.#onceSubscribers.has(subscriber)) {
                this.unsubscribe(subscriber);
            }
        });
    }

    clear(): void {
        this.#subscribers = new Set();
    }
}

export type EventMap = Record<string, unknown[]>;

export interface Eventable<E extends EventMap> {
    on<K extends keyof E>(event: K, subscriber: Subscriber<E[K]>): this;
    once<K extends keyof E>(event: K, subscriber: Subscriber<E[K]>): this;
    off<K extends keyof E>(event: K, subscriber: Subscriber<E[K]>): boolean;
}

export type EventList<E extends EventMap> = {
    [K in keyof E]: [K, ...E[K]];
}[keyof E];

export class EventEmitter<E extends EventMap> implements Eventable<E> {
    #subscribers: {
        [K in keyof E]?: Set<Subscriber<E[K]>>;
    } = {};

    #onceSubscribers: {
        [K in keyof E]?: WeakSet<Subscriber<E[K]>>;
    } = {};

    getSuscribers<K extends keyof E>(event: K): Set<Subscriber<E[K]>> {
        if (!this.#subscribers[event]) {
            this.#subscribers[event] = new Set();
            this.#onceSubscribers[event] = new WeakSet();
        }
        const subscribers = this.#subscribers[event]!;
        return subscribers;
    }

    on<K extends keyof E>(event: K, subscriber: Subscriber<E[K]>): this {
        const subscribers = this.getSuscribers(event);
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
        return this.getSuscribers(event).delete(subscriber);
    }

    emit<K extends keyof E>(event: K, ...args: E[K]): void;
    emit(...eventList: EventList<E>): void;
    emit<K extends keyof E>(event: K, ...args: E[K]): void {
        if (!this.#subscribers[event]) {
            return;
        }
        this.getSuscribers(event).forEach((subscriber) => {
            subscriber(...args);
            if (this.#onceSubscribers[event]?.has(subscriber)) {
                this.off(event, subscriber);
            }
        });
    }

    clear(): void {
        this.#subscribers = {};
        this.#onceSubscribers = {};
    }
}
