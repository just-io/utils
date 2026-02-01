import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { EventEmitter, EventTuple, Notifier } from './event-emitter';

type Event = [first: string, second: string];

describe('Notifier', () => {
    test('should call subscriber', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn = mock.fn((first: string, second: string) => {});
        const notifier = new Notifier<Event>();
        notifier.subscribe(fn);

        assert.deepEqual(fn.mock.callCount(), 0);

        notifier.notify('a', 'b');

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should call two subscriber', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn1 = mock.fn((first: string, second: string) => {});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn2 = mock.fn((first: string, second: string) => {});
        const notifier = new Notifier<Event>();
        notifier.subscribe(fn1);
        notifier.subscribe(fn2);

        assert.deepEqual(fn1.mock.callCount(), 0);
        assert.deepEqual(fn2.mock.callCount(), 0);

        notifier.notify('a', 'b');

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 1);
    });

    test('should remove subscriber', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn = mock.fn((first: string, second: string) => {});
        const notifier = new Notifier<Event>();
        notifier.subscribe(fn);

        assert.deepEqual(fn.mock.callCount(), 0);

        notifier.notify('a', 'b');

        assert.deepEqual(fn.mock.callCount(), 1);

        notifier.unsubscribe(fn);

        notifier.notify('a', 'b');

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should call subscriber once', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn = mock.fn((first: string, second: string) => {});
        const notifier = new Notifier<Event>();
        notifier.subscribe(fn, { once: true });

        assert.deepEqual(fn.mock.callCount(), 0);

        notifier.notify('a', 'b');

        assert.deepEqual(fn.mock.callCount(), 1);

        notifier.notify('a', 'b');

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should clear subscribers', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn1 = mock.fn((first: string, second: string) => {});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn2 = mock.fn((first: string, second: string) => {});
        const notifier = new Notifier<Event>();
        notifier.subscribe(fn1);
        notifier.subscribe(fn2);

        assert.deepEqual(fn1.mock.callCount(), 0);
        assert.deepEqual(fn2.mock.callCount(), 0);

        notifier.notify('a', 'b');

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 1);

        notifier.unsubscribeAll();
        notifier.notify('a', 'b');

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 1);
    });
});

type EventMap = {
    one: [first: number];
    two: [first: string, second: number];
};

type ETuple = EventTuple<EventMap>;

describe('EventEmitter', () => {
    test('should call subscriber on one event', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn = mock.fn((first: number) => {});
        const eventEmitter = new EventEmitter<EventMap>();
        eventEmitter.on('one', fn);
        assert.deepEqual(fn.mock.callCount(), 0);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should call subscriber on one event by common type', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fnOne = mock.fn((first: number) => {});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fnTwo = mock.fn((first: string, second: number) => {});
        const eventEmitter = new EventEmitter<EventMap>();
        eventEmitter.on('one', fnOne);
        eventEmitter.on('two', fnTwo);
        assert.deepEqual(fnOne.mock.callCount(), 0);
        assert.deepEqual(fnTwo.mock.callCount(), 0);

        const event = ['two', '2', 1] as ETuple;
        eventEmitter.emit(...event);

        assert.deepEqual(fnOne.mock.callCount(), 0);
        assert.deepEqual(fnTwo.mock.callCount(), 1);

        const eventTuples: ETuple[] = [
            ['one', 1],
            ['two', '2', 1],
        ];
        for (const eventTuple of eventTuples) {
            eventEmitter.emit(...eventTuple);
        }

        assert.deepEqual(fnOne.mock.callCount(), 1);
        assert.deepEqual(fnTwo.mock.callCount(), 2);
    });

    test('should call subscribers on two event', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fnOne = mock.fn((first: number) => {});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fnTwo = mock.fn((first: string, second: number) => {});
        const eventEmitter = new EventEmitter<EventMap>();
        eventEmitter.on('one', fnOne);
        eventEmitter.on('two', fnTwo);

        assert.deepEqual(fnOne.mock.callCount(), 0);
        assert.deepEqual(fnTwo.mock.callCount(), 0);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fnOne.mock.callCount(), 1);
        assert.deepEqual(fnTwo.mock.callCount(), 0);

        eventEmitter.emit('two', '1', 2);

        assert.deepEqual(fnOne.mock.callCount(), 1);
        assert.deepEqual(fnTwo.mock.callCount(), 1);
    });

    test('should remove subscriber', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn = mock.fn((first: number) => {});
        const eventEmitter = new EventEmitter<EventMap>();
        eventEmitter.on('one', fn);

        assert.deepEqual(fn.mock.callCount(), 0);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn.mock.callCount(), 1);

        eventEmitter.off('one', fn);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should call subscriber once', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn = mock.fn((first: number) => {});
        const eventEmitter = new EventEmitter<EventMap>();
        eventEmitter.once('one', fn);

        assert.deepEqual(fn.mock.callCount(), 0);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn.mock.callCount(), 1);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should unsubscribe all event subscribers', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fnOne = mock.fn((first: number) => {});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fnTwo = mock.fn((first: string, second: number) => {});
        const eventEmitter = new EventEmitter<EventMap>();
        eventEmitter.on('one', fnOne);
        eventEmitter.on('two', fnTwo);

        assert.deepEqual(eventEmitter.getSuscribers('one').size, 1);
        assert.deepEqual(eventEmitter.getSuscribers('two').size, 1);

        eventEmitter.unsubscribeAll('one');

        assert.deepEqual(eventEmitter.getSuscribers('one').size, 0);
        assert.deepEqual(eventEmitter.getSuscribers('two').size, 1);
    });

    test('should unsubscribe all subscribers', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fnOne = mock.fn((first: number) => {});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fnTwo = mock.fn((first: string, second: number) => {});
        const eventEmitter = new EventEmitter<EventMap>();
        eventEmitter.on('one', fnOne);
        eventEmitter.on('two', fnTwo);

        assert.deepEqual(eventEmitter.getSuscribers('one').size, 1);
        assert.deepEqual(eventEmitter.getSuscribers('two').size, 1);

        eventEmitter.unsubscribeAll();

        assert.deepEqual(eventEmitter.getSuscribers('one').size, 0);
        assert.deepEqual(eventEmitter.getSuscribers('two').size, 0);
    });

    test('should create store', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fn = mock.fn((first: number) => {});
        const eventEmitter = new EventEmitter<EventMap>();
        eventEmitter.on('one', fn);

        const store = eventEmitter.makeStore();

        store.add('one', 1);
        store.add('one', 2);

        assert.deepEqual(fn.mock.callCount(), 0);

        store.emit();

        assert.deepEqual(fn.mock.callCount(), 2);

        store.emit();

        assert.deepEqual(fn.mock.callCount(), 2);
    });
});
