import assert from 'node:assert/strict';
import { describe, test, mock } from 'node:test';
import { DeepMap } from './deep-map';

describe('DeepMap', () => {
    describe('method set', () => {
        test('should set and get value with zero keys', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');

            assert.equal(deepMap.get([]), 'str');
        });

        test('should set and get value with one key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one'], 'str');

            assert.equal(deepMap.get(['one']), 'str');
        });

        test('should set and get value with two key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one', 'two'], 'str');

            assert.equal(deepMap.get(['one', 'two']), 'str');
        });
    });

    describe('method get', () => {
        test('should get undefined value with zero keys', () => {
            const deepMap = new DeepMap<string, string>();

            assert.equal(deepMap.get([]), undefined);
        });

        test('should get undefined value with one key', () => {
            const deepMap = new DeepMap<string, string>();

            assert.equal(deepMap.get(['one']), undefined);
        });

        test('should get undefined value with two key', () => {
            const deepMap = new DeepMap<string, string>();

            assert.equal(deepMap.get(['one', 'two']), undefined);
        });
    });

    describe('method has', () => {
        test('should return true on existing key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one'], 'str');

            assert.equal(deepMap.has(['one']), true);
        });

        test('should return false on existing key', () => {
            const deepMap = new DeepMap<string, string>();

            assert.equal(deepMap.has(['one']), false);
        });
    });

    describe('method delete', () => {
        test('should delete value with zero keys', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');

            assert.equal(deepMap.has([]), true);

            deepMap.delete([]);

            assert.equal(deepMap.has([]), false);
        });

        test('should delete value with one key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one'], 'str');

            assert.equal(deepMap.has(['one']), true);

            deepMap.delete(['one']);

            assert.equal(deepMap.has(['one']), false);
        });

        test('should delete value with two key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one', 'two'], 'str');

            assert.equal(deepMap.has(['one', 'two']), true);

            deepMap.delete(['one', 'two']);

            assert.equal(deepMap.has(['one', 'two']), false);
        });

        test('should delete on unset keys', () => {
            const deepMap = new DeepMap<string, string>();

            assert.equal(deepMap.has([]), false);

            deepMap.delete([]);

            assert.equal(deepMap.has([]), false);
        });
    });

    describe('method extract', () => {
        test('should extract value with zero keys', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');

            assert.equal(deepMap.extract([]), 'str');
            assert.equal(deepMap.has([]), false);
        });

        test('should extract value with one key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one'], 'str');

            assert.equal(deepMap.extract(['one']), 'str');
            assert.equal(deepMap.has(['one']), false);
        });

        test('should extract value with two key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one', 'two'], 'str');

            assert.equal(deepMap.extract(['one', 'two']), 'str');
            assert.equal(deepMap.has(['one', 'two']), false);
        });

        test('should extract on unset keys', () => {
            const deepMap = new DeepMap<string, string>();

            assert.equal(deepMap.extract([]), undefined);
            assert.equal(deepMap.has([]), false);
        });
    });

    describe('method clear', () => {
        test('should clear map', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');
            deepMap.set(['one'], 'str');
            deepMap.set(['one', 'two'], 'str');

            assert.equal(deepMap.has([]), true);
            assert.equal(deepMap.has(['one']), true);
            assert.equal(deepMap.has(['one', 'two']), true);

            deepMap.clear();

            assert.equal(deepMap.has([]), false);
            assert.equal(deepMap.has(['one']), false);
            assert.equal(deepMap.has(['one', 'two']), false);
        });
    });

    describe('method size', () => {
        test('should return 0 on empty map', () => {
            const deepMap = new DeepMap<string, string>();

            assert.equal(deepMap.size, 0);
        });

        test('should return count', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');
            deepMap.set(['one'], 'str');
            deepMap.set(['one', 'two'], 'str');

            assert.equal(deepMap.size, 3);
        });
    });

    describe('method forEach', () => {
        test('should call 0 times', () => {
            const deepMap = new DeepMap<string, string>();
            const fn = mock.fn();

            deepMap.forEach(fn);
            assert.equal(fn.mock.callCount(), 0);
        });

        test('should call on each', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');
            deepMap.set(['one'], 'str');
            deepMap.set(['one', 'two'], 'str');

            const arr: [string, string[]][] = [];

            deepMap.forEach((value, key) => {
                arr.push([value, key]);
            });

            assert.deepStrictEqual(arr, [
                ['str', []],
                ['str', ['one']],
                ['str', ['one', 'two']],
            ]);
        });
    });

    describe('method entries', () => {
        test('should return empty array', () => {
            const deepMap = new DeepMap<string, string>();

            assert.deepStrictEqual(Array.from(deepMap.entries()), []);
        });

        test('should return array of keys and values', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');
            deepMap.set(['one'], 'str');
            deepMap.set(['one', 'two'], 'str');

            assert.deepStrictEqual(Array.from(deepMap.entries()), [
                [[], 'str'],
                [['one'], 'str'],
                [['one', 'two'], 'str'],
            ]);
        });
    });

    describe('method keys', () => {
        test('should return empty array', () => {
            const deepMap = new DeepMap<string, string>();

            assert.deepStrictEqual(Array.from(deepMap.keys()), []);
        });

        test('should return array of keys', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');
            deepMap.set(['one'], 'str');
            deepMap.set(['one', 'two'], 'str');

            assert.deepStrictEqual(Array.from(deepMap.keys()), [[], ['one'], ['one', 'two']]);
        });
    });

    describe('method values', () => {
        test('should return empty array', () => {
            const deepMap = new DeepMap<string, string>();

            assert.deepStrictEqual(Array.from(deepMap.values()), []);
        });

        test('should return array of values', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');
            deepMap.set(['one'], 'str');
            deepMap.set(['one', 'two'], 'str');

            assert.deepStrictEqual(Array.from(deepMap.values()), ['str', 'str', 'str']);
        });
    });

    describe('method [Symbol.iterator]', () => {
        test('should call 0 times', () => {
            const deepMap = new DeepMap<string, string>();
            const fn = mock.fn();

            for (const {} of deepMap) {
                fn();
            }
            assert.equal(fn.mock.callCount(), 0);
        });

        test('should call on each', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');
            deepMap.set(['one'], 'str');
            deepMap.set(['one', 'two'], 'str');

            const arr: [string[], string][] = [];

            for (const [key, value] of deepMap) {
                arr.push([key, value]);
            }

            assert.deepStrictEqual(arr, [
                [[], 'str'],
                [['one'], 'str'],
                [['one', 'two'], 'str'],
            ]);
        });
    });
});
