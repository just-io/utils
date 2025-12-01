import { describe, test } from 'node:test';
import assert from 'node:assert';
import { debounce, debounceByKey } from './debounce';

describe('debounce', () => {
    test('should call after', (context) => {
        context.mock.timers.enable({ apis: ['setTimeout'] });
        const fn = context.mock.fn();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function setFilterValue(values: string[]): void {
            fn();
        }

        const debouncedSetFilterValue = debounce(setFilterValue, 1000);

        assert.equal(fn.mock.callCount(), 0);

        debouncedSetFilterValue(['first']);
        context.mock.timers.tick(1000);

        assert.equal(fn.mock.callCount(), 1);
    });

    test('should call after with last parameters', (context) => {
        context.mock.timers.enable({ apis: ['setTimeout'] });
        const fn = context.mock.fn();
        function setFilterValue(values: string[]): void {
            assert.deepStrictEqual(values, ['second']);
            fn();
        }

        const debouncedSetFilterValue = debounce(setFilterValue, 1000);

        assert.equal(fn.mock.callCount(), 0);

        debouncedSetFilterValue(['first']);
        context.mock.timers.tick(300);
        debouncedSetFilterValue(['second']);
        context.mock.timers.tick(1000);

        assert.equal(fn.mock.callCount(), 1);
    });

    test('should not call after teardown', (context) => {
        context.mock.timers.enable({ apis: ['setTimeout'] });
        const fn = context.mock.fn();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function setFilterValue(values: string[]): void {
            fn();
        }

        const debouncedSetFilterValue = debounce(setFilterValue, 1000);

        assert.equal(fn.mock.callCount(), 0);

        debouncedSetFilterValue(['first']);
        context.mock.timers.tick(300);
        debouncedSetFilterValue.teardown();
        context.mock.timers.tick(1000);

        assert.equal(fn.mock.callCount(), 0);
    });
});

describe('debounceByKey', () => {
    test('should call after', (context) => {
        context.mock.timers.enable({ apis: ['setTimeout'] });
        const fn1 = context.mock.fn();
        const fn2 = context.mock.fn();
        function notify(event: { type: string; at: number }): void {
            if (event.type === 'change') {
                fn1();
            }
            if (event.type === 'update') {
                fn2();
            }
        }

        const debouncedNotify = debounceByKey(notify, (event) => event.type, 1000);

        assert.equal(fn1.mock.callCount(), 0);
        assert.equal(fn2.mock.callCount(), 0);

        debouncedNotify({ type: 'change', at: 0 });
        context.mock.timers.tick(1000);

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 0);

        debouncedNotify({ type: 'update', at: 0 });
        context.mock.timers.tick(1000);

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 1);
    });

    test('should call after with last parameters', (context) => {
        context.mock.timers.enable({ apis: ['setTimeout'] });
        const fn1 = context.mock.fn();
        const fn2 = context.mock.fn();
        function notify(event: { type: string; at: number }): void {
            if (event.type === 'change') {
                assert.deepStrictEqual(event, { type: 'change', at: 10 });
                fn1();
            }
            if (event.type === 'update') {
                assert.deepStrictEqual(event, { type: 'update', at: 0 });
                fn2();
            }
        }

        const debouncedNotify = debounceByKey(notify, (event) => event.type, 1000);

        assert.equal(fn1.mock.callCount(), 0);
        assert.equal(fn2.mock.callCount(), 0);

        debouncedNotify({ type: 'change', at: 0 });
        context.mock.timers.tick(300);
        debouncedNotify({ type: 'change', at: 10 });
        context.mock.timers.tick(1000);

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 0);

        debouncedNotify({ type: 'update', at: 0 });
        context.mock.timers.tick(1000);

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 1);
    });

    test('should not call after teardown', (context) => {
        context.mock.timers.enable({ apis: ['setTimeout'] });
        const fn1 = context.mock.fn();
        const fn2 = context.mock.fn();
        function notify(event: { type: string; at: number }): void {
            if (event.type === 'change') {
                fn1();
            }
            if (event.type === 'update') {
                fn2();
            }
        }

        const debouncedNotify = debounceByKey(notify, (event) => event.type, 1000);

        assert.equal(fn1.mock.callCount(), 0);
        assert.equal(fn2.mock.callCount(), 0);

        debouncedNotify({ type: 'change', at: 0 });
        debouncedNotify({ type: 'update', at: 0 });
        context.mock.timers.tick(300);
        debouncedNotify.teardown({ type: 'change', at: 0 });
        context.mock.timers.tick(1000);

        assert.equal(fn1.mock.callCount(), 0);
        assert.equal(fn2.mock.callCount(), 1);
    });

    test('should not call after teardownAll', (context) => {
        context.mock.timers.enable({ apis: ['setTimeout'] });
        const fn1 = context.mock.fn();
        const fn2 = context.mock.fn();
        function notify(event: { type: string; at: number }): void {
            if (event.type === 'change') {
                fn1();
            }
            if (event.type === 'update') {
                fn2();
            }
        }

        const debouncedNotify = debounceByKey(notify, (event) => event.type, 1000);

        assert.equal(fn1.mock.callCount(), 0);
        assert.equal(fn2.mock.callCount(), 0);

        debouncedNotify({ type: 'change', at: 0 });
        debouncedNotify({ type: 'update', at: 0 });
        context.mock.timers.tick(300);
        debouncedNotify.teardownAll();
        context.mock.timers.tick(1000);

        assert.equal(fn1.mock.callCount(), 0);
        assert.equal(fn2.mock.callCount(), 0);
    });
});
