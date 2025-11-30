import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { EventEmitter, Notifier } from './event-emitter';

describe('Notifier', () => {
    test('should call subscriber', () => {
        const fn = mock.fn();
        const notifier = new Notifier<[first: string, second: string]>();
        notifier.subscribe(fn);

        assert.deepEqual(fn.mock.callCount(), 0);

        notifier.notify('a', 'b');

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should call two subscriber', () => {
        const fn1 = mock.fn();
        const fn2 = mock.fn();
        const notifier = new Notifier<[first: string, second: string]>();
        notifier.subscribe(fn1);
        notifier.subscribe(fn2);

        assert.deepEqual(fn1.mock.callCount(), 0);
        assert.deepEqual(fn2.mock.callCount(), 0);

        notifier.notify('a', 'b');

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 1);
    });

    test('should remove subscriber', () => {
        const fn = mock.fn();
        const notifier = new Notifier<[first: string, second: string]>();
        notifier.subscribe(fn);

        assert.deepEqual(fn.mock.callCount(), 0);

        notifier.notify('a', 'b');

        assert.deepEqual(fn.mock.callCount(), 1);

        notifier.unsubscribe(fn);

        notifier.notify('a', 'b');

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should call subscriber once', () => {
        const fn = mock.fn();
        const notifier = new Notifier<[first: string, second: string]>();
        notifier.subscribe(fn, { once: true });

        assert.deepEqual(fn.mock.callCount(), 0);

        notifier.notify('a', 'b');

        assert.deepEqual(fn.mock.callCount(), 1);

        notifier.notify('a', 'b');

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should clear subscribers', () => {
        const fn1 = mock.fn();
        const fn2 = mock.fn();
        const notifier = new Notifier<[first: string, second: string]>();
        notifier.subscribe(fn1);
        notifier.subscribe(fn2);

        assert.deepEqual(fn1.mock.callCount(), 0);
        assert.deepEqual(fn2.mock.callCount(), 0);

        notifier.notify('a', 'b');

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 1);

        notifier.clear();
        notifier.notify('a', 'b');

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 1);
    });
});

describe('EventEmitter', () => {
    test('should call subscriber on one event', () => {
        const fn = mock.fn();
        const eventEmitter = new EventEmitter<{
            one: [first: number];
            two: [first: string, second: number];
        }>();
        eventEmitter.on('one', fn);
        assert.deepEqual(fn.mock.callCount(), 0);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should call subscribers on two event', () => {
        const fn1 = mock.fn();
        const fn2 = mock.fn();
        const eventEmitter = new EventEmitter<{
            one: [first: number];
            two: [first: string, second: number];
        }>();
        eventEmitter.on('one', fn1);
        eventEmitter.on('two', fn2);

        assert.deepEqual(fn1.mock.callCount(), 0);
        assert.deepEqual(fn2.mock.callCount(), 0);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 0);

        eventEmitter.emit('two', '1', 2);

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 1);
    });

    test('should remove subscriber', () => {
        const fn = mock.fn();
        const eventEmitter = new EventEmitter<{
            one: [first: number];
            two: [first: string, second: number];
        }>();
        eventEmitter.on('one', fn);

        assert.deepEqual(fn.mock.callCount(), 0);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn.mock.callCount(), 1);

        eventEmitter.off('one', fn);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should call subscriber once', () => {
        const fn = mock.fn();
        const eventEmitter = new EventEmitter<{
            one: [first: number];
            two: [first: string, second: number];
        }>();
        eventEmitter.once('one', fn);

        assert.deepEqual(fn.mock.callCount(), 0);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn.mock.callCount(), 1);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn.mock.callCount(), 1);
    });

    test('should clear subscribers', () => {
        const fn1 = mock.fn();
        const fn2 = mock.fn();
        const eventEmitter = new EventEmitter<{
            one: [first: number];
            two: [first: string, second: number];
        }>();
        eventEmitter.on('one', fn1);
        eventEmitter.on('two', fn2);

        assert.deepEqual(fn1.mock.callCount(), 0);
        assert.deepEqual(fn2.mock.callCount(), 0);

        eventEmitter.emit('one', 1);

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 0);

        eventEmitter.emit('two', '1', 2);

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 1);

        eventEmitter.clear();
        eventEmitter.emit('one', 1);
        eventEmitter.emit('two', '1', 2);

        assert.deepEqual(fn1.mock.callCount(), 1);
        assert.deepEqual(fn2.mock.callCount(), 1);
    });
});
