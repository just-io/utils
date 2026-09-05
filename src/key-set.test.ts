import assert from 'node:assert/strict';
import { describe, test, mock } from 'node:test';
import { KeySet } from './key-set';

describe('KeySet', () => {
    describe('method new', () => {
        test('should create with zero entries', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );

            assert.equal(keySet.size, 0);
        });

        test('should create with one entry', () => {
            const keySet = new KeySet<[string, number], string>(
                (value) => value[0].repeat(value[1]),
                [['one', 1]],
            );

            assert.equal(keySet.has(['one', 1]), true);
        });

        test('should create value with two entries', () => {
            const keySet = new KeySet<[string, number], string>(
                (value) => value[0].repeat(value[1]),
                [
                    ['one', 1],
                    ['two', 2],
                ],
            );

            assert.equal(keySet.has(['one', 1]), true);
            assert.equal(keySet.has(['two', 2]), true);
        });

        test('should create value by other set', () => {
            const originKeySet = new KeySet<[string, number], string>(
                (value) => value[0].repeat(value[1]),
                [
                    ['one', 1],
                    ['two', 2],
                ],
            );
            const keySet = new KeySet<[string, number], string>(
                (value) => value[0].repeat(value[1]),
                originKeySet,
            );

            assert.equal(originKeySet.has(['one', 1]), true);
            assert.equal(originKeySet.has(['two', 2]), true);
            assert.equal(keySet.has(['one', 1]), true);
            assert.equal(keySet.has(['two', 2]), true);

            originKeySet.delete(['one', 1]);
            originKeySet.delete(['two', 2]);

            assert.equal(originKeySet.has(['one', 1]), false);
            assert.equal(originKeySet.has(['two', 2]), false);
            assert.equal(keySet.has(['one', 1]), true);
            assert.equal(keySet.has(['two', 2]), true);
        });
    });

    describe('method add', () => {
        test('should add and has value', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);

            assert.equal(keySet.has(['one', 1]), true);
        });

        test('should rewrite', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);

            assert.equal(keySet.has(['one', 1]), true);

            keySet.add(['one', 1]);

            assert.equal(keySet.size, 1);
        });
    });

    describe('method has', () => {
        test('should return true on existing key', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);

            assert.equal(keySet.has(['one', 1]), true);
        });

        test('should return false on unexisting key', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );

            assert.equal(keySet.has(['one', 1]), false);
        });
    });

    describe('method delete', () => {
        test('should delete value', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);

            assert.equal(keySet.has(['one', 1]), true);

            assert.equal(keySet.delete(['one', 1]), true);

            assert.equal(keySet.has(['one', 1]), false);

            assert.equal(keySet.delete(['one', 1]), false);
        });
    });

    describe('method clear', () => {
        test('should clear set', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);
            keySet.add(['two', 2]);

            assert.equal(keySet.has(['one', 1]), true);
            assert.equal(keySet.has(['two', 2]), true);

            keySet.clear();

            assert.equal(keySet.has(['one', 1]), false);
            assert.equal(keySet.has(['two', 2]), false);
        });
    });

    describe('method size', () => {
        test('should return 0 on empty set', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );

            assert.equal(keySet.size, 0);
        });

        test('should return count', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);
            keySet.add(['two', 2]);

            assert.equal(keySet.size, 2);
        });

        test('should return count after deleting', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);
            keySet.add(['two', 2]);
            keySet.delete(['two', 2]);

            assert.equal(keySet.size, 1);
        });
    });

    describe('method forEach', () => {
        test('should call 0 times', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            const fn = mock.fn();

            keySet.forEach(fn);
            assert.equal(fn.mock.callCount(), 0);
        });

        test('should call on each', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);
            keySet.add(['two', 2]);

            const arr: [[string, number], [string, number]][] = [];

            keySet.forEach((value, key) => {
                arr.push([value, key]);
            });

            assert.deepStrictEqual(arr, [
                [
                    ['one', 1],
                    ['one', 1],
                ],
                [
                    ['two', 2],
                    ['two', 2],
                ],
            ]);
        });
    });

    describe('method entries', () => {
        test('should return empty array', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );

            assert.deepStrictEqual(Array.from(keySet.entries()), []);
        });

        test('should return array of keys and values', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);
            keySet.add(['two', 2]);

            assert.deepStrictEqual(Array.from(keySet.entries()), [
                [
                    ['one', 1],
                    ['one', 1],
                ],
                [
                    ['two', 2],
                    ['two', 2],
                ],
            ]);
        });
    });

    describe('method keys', () => {
        test('should return empty array', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );

            assert.deepStrictEqual(Array.from(keySet.keys()), []);
        });

        test('should return array of keys', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);
            keySet.add(['two', 2]);

            assert.deepStrictEqual(Array.from(keySet.keys()), [
                ['one', 1],
                ['two', 2],
            ]);
        });
    });

    describe('method values', () => {
        test('should return empty array', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );

            assert.deepStrictEqual(Array.from(keySet.values()), []);
        });

        test('should return array of values', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);
            keySet.add(['two', 2]);

            assert.deepStrictEqual(Array.from(keySet.values()), [
                ['one', 1],
                ['two', 2],
            ]);
        });
    });

    describe('method [Symbol.iterator]', () => {
        test('should call 0 times', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            const fn = mock.fn();

            for (const {} of keySet) {
                fn();
            }
            assert.equal(fn.mock.callCount(), 0);
        });

        test('should call on each', () => {
            const keySet = new KeySet<[string, number], string>((value) =>
                value[0].repeat(value[1]),
            );
            keySet.add(['one', 1]);
            keySet.add(['two', 2]);

            const arr: [string, number][] = [];

            for (const value of keySet) {
                arr.push(value);
            }

            assert.deepStrictEqual(arr, [
                ['one', 1],
                ['two', 2],
            ]);
        });
    });

    describe('method union', () => {
        test('should return empty set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            const anotherSet = new Set<number>();

            assert.deepStrictEqual(Array.from(keySet.union(anotherSet).values()), []);
        });

        test('should return union set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            keySet.add(1);
            keySet.add(2);

            const anotherSet = new Set<number>([2, 3]);

            assert.deepStrictEqual(Array.from(keySet.union(anotherSet).values()), [1, 2, 3]);
        });
    });

    describe('method intersection', () => {
        test('should return empty set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            const anotherSet = new Set<string>();

            assert.deepStrictEqual(Array.from(keySet.intersection(anotherSet).values()), []);
        });

        test('should return intersection set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            keySet.add(1);
            keySet.add(2);

            const anotherSet = new Set<number>([2, 3]);

            assert.deepStrictEqual(Array.from(keySet.intersection(anotherSet).values()), [2]);
        });
    });

    describe('method difference', () => {
        test('should return empty set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            const anotherSet = new Set<string>();

            assert.deepStrictEqual(Array.from(keySet.difference(anotherSet).values()), []);
        });

        test('should return difference set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            keySet.add(1);
            keySet.add(2);

            const anotherSet = new Set<number>([2, 3]);

            assert.deepStrictEqual(Array.from(keySet.difference(anotherSet).values()), [1]);
        });
    });

    describe('method symmetricDifference', () => {
        test('should return empty set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            const anotherSet = new Set<string>();

            assert.deepStrictEqual(Array.from(keySet.symmetricDifference(anotherSet).values()), []);
        });

        test('should return symmetricDifference set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            keySet.add(1);
            keySet.add(2);

            const anotherSet = new Set<number>([2, 3]);

            assert.deepStrictEqual(
                Array.from(keySet.symmetricDifference(anotherSet).values()),
                [1, 3],
            );
        });
    });

    describe('method isSubsetOf', () => {
        test('should return true for empty set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            const anotherSet = new Set<string>();

            assert.deepStrictEqual(keySet.isSubsetOf(anotherSet), true);
        });

        test('should return true', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            keySet.add(1);
            keySet.add(2);

            const anotherSet = new Set<number>([1, 2, 3]);

            assert.deepStrictEqual(keySet.isSubsetOf(anotherSet), true);
        });

        test('should return false', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            keySet.add(1);
            keySet.add(2);

            const anotherSet = new Set<number>([2, 3]);

            assert.deepStrictEqual(keySet.isSubsetOf(anotherSet), false);
        });
    });

    describe('method isSupersetOf', () => {
        test('should return true for empty set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            const anotherSet = new Set<string>();

            assert.deepStrictEqual(keySet.isSupersetOf(anotherSet), true);
        });

        test('should return true', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            keySet.add(1);
            keySet.add(2);
            keySet.add(3);

            const anotherSet = new Set<number>([2, 3]);

            assert.deepStrictEqual(keySet.isSupersetOf(anotherSet), true);
        });

        test('should return false', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            keySet.add(1);
            keySet.add(2);

            const anotherSet = new Set<number>([2, 3]);

            assert.deepStrictEqual(keySet.isSupersetOf(anotherSet), false);
        });
    });

    describe('method isDisjointFrom', () => {
        test('should return true for empty set', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            const anotherSet = new Set<string>();

            assert.deepStrictEqual(keySet.isDisjointFrom(anotherSet), true);
        });

        test('should return true', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            keySet.add(1);
            keySet.add(2);

            const anotherSet = new Set<number>([3, 4]);

            assert.deepStrictEqual(keySet.isDisjointFrom(anotherSet), true);
        });

        test('should return false', () => {
            const keySet = new KeySet<number, string>((value) => String(value));
            keySet.add(1);
            keySet.add(2);

            const anotherSet = new Set<number>([2, 3]);

            assert.deepStrictEqual(keySet.isDisjointFrom(anotherSet), false);
        });
    });
});
