import assert from 'node:assert/strict';
import { describe, test, mock } from 'node:test';
import { TupleMap } from './tuple-map';

const date = new Date();

describe('TupleMap', () => {
    describe('method new', () => {
        test('should create with zero entries', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();

            assert.equal(tupleMap.size, 0);
        });

        test('should create with one entry', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>([
                [['one', 1, date], 'str'],
            ]);

            assert.equal(tupleMap.get(['one', 1, date]), 'str');
        });

        test('should create value with two entries', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>([
                [['one', 1, date], 'str'],
                [['two', 2, date], 'str'],
            ]);

            assert.equal(tupleMap.get(['one', 1, date]), 'str');
            assert.equal(tupleMap.get(['two', 2, date]), 'str');
        });

        test('should create value by other map', () => {
            const originTupleMap = new TupleMap<[string, number, Date], string>([
                [['one', 1, date], 'str'],
                [['two', 2, date], 'str'],
            ]);
            const tupleMap = new TupleMap<[string, number, Date], string>(originTupleMap);

            assert.equal(originTupleMap.get(['one', 1, date]), 'str');
            assert.equal(originTupleMap.get(['two', 2, date]), 'str');
            assert.equal(tupleMap.get(['one', 1, date]), 'str');
            assert.equal(tupleMap.get(['two', 2, date]), 'str');

            originTupleMap.delete(['one', 1, date]);
            originTupleMap.delete(['two', 2, date]);

            assert.equal(tupleMap.get(['one', 1, date]), 'str');
            assert.equal(tupleMap.get(['two', 2, date]), 'str');
        });
    });

    describe('method set', () => {
        test('should set and get value', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');

            assert.equal(tupleMap.get(['one', 1, date]), 'str');
        });

        test('should reset and get value', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');

            assert.equal(tupleMap.get(['one', 1, date]), 'str');

            tupleMap.set(['one', 1, date], 'str2');

            assert.equal(tupleMap.get(['one', 1, date]), 'str2');
        });
    });

    describe('method get', () => {
        test('should get undefined value', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();

            assert.equal(tupleMap.get(['one', 1, date]), undefined);
        });
    });

    describe('method has', () => {
        test('should return true on existing key', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');

            assert.equal(tupleMap.has(['one', 1, date]), true);
        });

        test('should return false on unexisting key', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();

            assert.equal(tupleMap.has(['one', 1, date]), false);
        });

        test('should return true on existing key with undefined value', () => {
            const tupleMap = new TupleMap<[string, number, Date], string | undefined>();
            tupleMap.set(['one', 1, date], undefined);

            assert.equal(tupleMap.has(['one', 1, date]), true);
        });
    });

    describe('method delete', () => {
        test('should delete value', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');

            assert.equal(tupleMap.has(['one', 1, date]), true);

            assert.equal(tupleMap.delete(['one', 1, date]), true);

            assert.equal(tupleMap.has(['one', 1, date]), false);

            assert.equal(tupleMap.delete(['one', 1, date]), false);
        });
    });

    describe('method take', () => {
        test('should take value', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');

            assert.equal(tupleMap.take(['one', 1, date]), 'str');
            assert.equal(tupleMap.has(['one', 1, date]), false);
        });
    });

    describe('method clear', () => {
        test('should clear map', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');
            tupleMap.set(['two', 2, date], 'str');

            assert.equal(tupleMap.has(['one', 1, date]), true);
            assert.equal(tupleMap.has(['two', 2, date]), true);

            tupleMap.clear();

            assert.equal(tupleMap.has(['one', 1, date]), false);
            assert.equal(tupleMap.has(['two', 2, date]), false);
        });
    });

    describe('method size', () => {
        test('should return 0 on empty map', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();

            assert.equal(tupleMap.size, 0);
        });

        test('should return count', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');
            tupleMap.set(['two', 2, date], 'str');

            assert.equal(tupleMap.size, 2);
        });

        test('should return count after deleting', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');
            tupleMap.set(['two', 2, date], 'str');
            tupleMap.delete(['two', 2, date]);

            assert.equal(tupleMap.size, 1);
        });
    });

    describe('method forEach', () => {
        test('should call 0 times', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            const fn = mock.fn();

            tupleMap.forEach(fn);
            assert.equal(fn.mock.callCount(), 0);
        });

        test('should call on each', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');
            tupleMap.set(['two', 2, date], 'str');

            const arr: [string, [string, number, Date]][] = [];

            tupleMap.forEach((value, key) => {
                arr.push([value, key]);
            });

            assert.deepStrictEqual(arr, [
                ['str', ['one', 1, date]],
                ['str', ['two', 2, date]],
            ]);
        });
    });

    describe('method entries', () => {
        test('should return empty array', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();

            assert.deepStrictEqual(Array.from(tupleMap.entries()), []);
        });

        test('should return array of keys and values', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');
            tupleMap.set(['two', 2, date], 'str');

            assert.deepStrictEqual(Array.from(tupleMap.entries()), [
                [['one', 1, date], 'str'],
                [['two', 2, date], 'str'],
            ]);
        });
    });

    describe('method keys', () => {
        test('should return empty array', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();

            assert.deepStrictEqual(Array.from(tupleMap.keys()), []);
        });

        test('should return array of keys', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');
            tupleMap.set(['two', 2, date], 'str');

            assert.deepStrictEqual(Array.from(tupleMap.keys()), [
                ['one', 1, date],
                ['two', 2, date],
            ]);
        });
    });

    describe('method values', () => {
        test('should return empty array', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();

            assert.deepStrictEqual(Array.from(tupleMap.values()), []);
        });

        test('should return array of values', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');
            tupleMap.set(['two', 2, date], 'str');

            assert.deepStrictEqual(Array.from(tupleMap.values()), ['str', 'str']);
        });
    });

    describe('method [Symbol.iterator]', () => {
        test('should call 0 times', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            const fn = mock.fn();

            for (const {} of tupleMap) {
                fn();
            }
            assert.equal(fn.mock.callCount(), 0);
        });

        test('should call on each', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');
            tupleMap.set(['two', 2, date], 'str');

            const arr: [[string, number, Date], string][] = [];

            for (const [key, value] of tupleMap) {
                arr.push([key, value]);
            }

            assert.deepStrictEqual(arr, [
                [['one', 1, date], 'str'],
                [['two', 2, date], 'str'],
            ]);
        });
    });

    describe('method clone', () => {
        test('should clone map by zero keys', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            const clonedTupleMap = tupleMap.clone();

            assert.equal(clonedTupleMap.size, 0);
        });

        test('should clone map', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.set(['one', 1, date], 'str');
            tupleMap.set(['two', 2, date], 'str');
            const clonedTupleMap = tupleMap.clone();

            assert.deepStrictEqual(Array.from(clonedTupleMap), [
                [['one', 1, date], 'str'],
                [['two', 2, date], 'str'],
            ]);
        });
    });

    describe('method append', () => {
        test('should append', () => {
            const tupleMap = new TupleMap<[string, number, Date], string>();
            tupleMap.append([
                [['one', 1, date], 'str'],
                [['two', 2, date], 'str'],
            ]);

            assert.equal(tupleMap.size, 2);
            assert.deepStrictEqual(Array.from(tupleMap), [
                [['one', 1, date], 'str'],
                [['two', 2, date], 'str'],
            ]);
        });
    });
});
