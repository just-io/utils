import { describe, test, mock } from 'node:test';
import assert from 'node:assert';
import { memo, memoByKey } from './memo';

describe('memo', () => {
    test('should call once', () => {
        const fn = mock.fn();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function notify(event: { type: string; at: number }): void {
            fn();
        }

        const memoNotify = memo(notify, (event) => [event.type, event.at]);

        memoNotify({ type: 'change', at: 0 });

        assert.equal(fn.mock.callCount(), 1);

        memoNotify({ type: 'change', at: 0 });

        assert.equal(fn.mock.callCount(), 1);
    });

    test('should call on changing memo arguments', () => {
        const fn = mock.fn();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function notify(event: { type: string; at: number }): void {
            fn();
        }

        const memoNotify = memo(notify, (event) => [event.type, event.at]);

        memoNotify({ type: 'change', at: 0 });

        assert.equal(fn.mock.callCount(), 1);

        memoNotify({ type: 'change', at: 1 });

        assert.equal(fn.mock.callCount(), 2);
    });

    test('should call only on changes', () => {
        const fn = mock.fn();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function setFilterValue(values: string[]): void {
            fn();
        }

        const memoSetFilterValue = memo(setFilterValue, (values) => values, true);

        memoSetFilterValue([]);

        assert.equal(fn.mock.callCount(), 0);

        memoSetFilterValue(['first']);

        assert.equal(fn.mock.callCount(), 1);
    });
});

describe('memoByKey', () => {
    test('should call once', () => {
        const fn1 = mock.fn();
        const fn2 = mock.fn();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function notify(channel: string, event: { type: string; at: number }): void {
            if (channel === 'channel1') {
                fn1();
            }
            if (channel === 'channel2') {
                fn2();
            }
        }

        const memoNotify = memoByKey(
            notify,
            (channel) => channel,
            (channel, event) => [event.type, event.at],
        );

        memoNotify('channel1', { type: 'change', at: 0 });

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 0);

        memoNotify('channel1', { type: 'change', at: 0 });

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 0);
    });

    test('should call two times', () => {
        const fn1 = mock.fn();
        const fn2 = mock.fn();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function notify(channel: string, event: { type: string; at: number }): void {
            if (channel === 'channel1') {
                fn1();
            }
            if (channel === 'channel2') {
                fn2();
            }
        }

        const memoNotify = memoByKey(
            notify,
            (channel) => channel,
            (channel, event) => [event.type, event.at],
        );

        memoNotify('channel1', { type: 'change', at: 0 });

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 0);

        memoNotify('channel2', { type: 'change', at: 0 });

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 1);

        memoNotify('channel1', { type: 'change', at: 0 });
        memoNotify('channel2', { type: 'change', at: 0 });

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 1);
    });

    test('should call two times on changes', () => {
        const fn1 = mock.fn();
        const fn2 = mock.fn();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function notify(channel: string, event: { type: string; at: number }): void {
            if (channel === 'channel1') {
                fn1();
            }
            if (channel === 'channel2') {
                fn2();
            }
        }

        const memoNotify = memoByKey(
            notify,
            (channel) => channel,
            (channel, event) => [event.type, event.at],
        );

        memoNotify('channel1', { type: 'change', at: 0 });

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 0);

        memoNotify('channel2', { type: 'change', at: 0 });

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 1);

        memoNotify('channel1', { type: 'change', at: 10 });

        assert.equal(fn1.mock.callCount(), 2);
        assert.equal(fn2.mock.callCount(), 1);

        memoNotify('channel2', { type: 'change', at: 10 });

        assert.equal(fn1.mock.callCount(), 2);
        assert.equal(fn2.mock.callCount(), 2);
    });

    test('should call only on changes', () => {
        const fn1 = mock.fn();
        const fn2 = mock.fn();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function setFilterValue(filter: string, values: string[]): void {
            if (filter === 'filter1') {
                fn1();
            }
            if (filter === 'filter2') {
                fn2();
            }
        }

        const memoSetFilterValue = memoByKey(
            setFilterValue,
            (filter) => filter,
            (filter, values) => values,
            true,
        );

        memoSetFilterValue('filter1', []);

        assert.equal(fn1.mock.callCount(), 0);
        assert.equal(fn2.mock.callCount(), 0);

        memoSetFilterValue('filter2', ['first']);

        assert.equal(fn1.mock.callCount(), 0);
        assert.equal(fn2.mock.callCount(), 0);

        memoSetFilterValue('filter1', ['1']);

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 0);

        memoSetFilterValue('filter2', ['second']);

        assert.equal(fn1.mock.callCount(), 1);
        assert.equal(fn2.mock.callCount(), 1);
    });
});
