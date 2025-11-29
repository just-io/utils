import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { DeepMap } from './deep-map';

describe('DeepMap', () => {
    describe('method set', () => {
        test('should set and get value with zero keys', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');

            assert.deepEqual(deepMap.get([]), 'str');
        });

        test('should set and get value with one key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one'], 'str');

            assert.deepEqual(deepMap.get(['one']), 'str');
        });

        test('should set and get value with two key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one', 'two'], 'str');

            assert.deepEqual(deepMap.get(['one', 'two']), 'str');
        });
    });

    describe('method get', () => {
        test('should get undefined value with zero keys', () => {
            const deepMap = new DeepMap<string, string>();

            assert.deepEqual(deepMap.get([]), undefined);
        });

        test('should get undefined value with one key', () => {
            const deepMap = new DeepMap<string, string>();

            assert.deepEqual(deepMap.get(['one']), undefined);
        });

        test('should get undefined value with two key', () => {
            const deepMap = new DeepMap<string, string>();

            assert.deepEqual(deepMap.get(['one', 'two']), undefined);
        });
    });

    describe('method has', () => {
        test('should return true on existing key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one'], 'str');

            assert.deepEqual(deepMap.has(['one']), true);
        });

        test('should return false on existing key', () => {
            const deepMap = new DeepMap<string, string>();

            assert.deepEqual(deepMap.has(['one']), false);
        });
    });

    describe('method delete', () => {
        test('should delete value with zero keys', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');

            assert.deepEqual(deepMap.has([]), true);

            deepMap.delete([]);

            assert.deepEqual(deepMap.has([]), false);
        });

        test('should delete value with one key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one'], 'str');

            assert.deepEqual(deepMap.has(['one']), true);

            deepMap.delete(['one']);

            assert.deepEqual(deepMap.has(['one']), false);
        });

        test('should delete value with two key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one', 'two'], 'str');

            assert.deepEqual(deepMap.has(['one', 'two']), true);

            deepMap.delete(['one', 'two']);

            assert.deepEqual(deepMap.has(['one', 'two']), false);
        });

        test('should delete on unset keys', () => {
            const deepMap = new DeepMap<string, string>();

            assert.deepEqual(deepMap.has([]), false);

            deepMap.delete([]);

            assert.deepEqual(deepMap.has([]), false);
        });
    });

    describe('method extract', () => {
        test('should extract value with zero keys', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');

            assert.deepEqual(deepMap.extract([]), 'str');
            assert.deepEqual(deepMap.has([]), false);
        });

        test('should extract value with one key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one'], 'str');

            assert.deepEqual(deepMap.extract(['one']), 'str');
            assert.deepEqual(deepMap.has(['one']), false);
        });

        test('should extract value with two key', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set(['one', 'two'], 'str');

            assert.deepEqual(deepMap.extract(['one', 'two']), 'str');
            assert.deepEqual(deepMap.has(['one', 'two']), false);
        });

        test('should extract on unset keys', () => {
            const deepMap = new DeepMap<string, string>();

            assert.deepEqual(deepMap.extract([]), undefined);
            assert.deepEqual(deepMap.has([]), false);
        });
    });

    describe('method clear', () => {
        test('should clear map', () => {
            const deepMap = new DeepMap<string, string>();
            deepMap.set([], 'str');
            deepMap.set(['one'], 'str');
            deepMap.set(['one', 'two'], 'str');

            assert.deepEqual(deepMap.has([]), true);
            assert.deepEqual(deepMap.has(['one']), true);
            assert.deepEqual(deepMap.has(['one', 'two']), true);

            deepMap.clear();

            assert.deepEqual(deepMap.has([]), false);
            assert.deepEqual(deepMap.has(['one']), false);
            assert.deepEqual(deepMap.has(['one', 'two']), false);
        });
    });
});
