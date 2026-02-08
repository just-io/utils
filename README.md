@just-io/utils
==============

Lightweight TypeScript utility functions.

## Installation

```bash
npm install @just-io/utils
```

## Utilities

### debounce / debounceByKey

Debounce function calls with optional key-based grouping.

```typescript
import { debounce, debounceByKey } from '@just-io/utils';

// Basic debounce - executes after delay with last arguments
function setFilterValue(values: string[]): void {
    console.log('Filter:', values);
}

const debouncedSetFilterValue = debounce(setFilterValue, 1000);

debouncedSetFilterValue(['first']);
// wait 300ms...
debouncedSetFilterValue(['second']); // Only ['second'] executes after 1000ms

// Cancel pending execution
debouncedSetFilterValue.teardown();

// Key-based debounce - separate timers per extracted key
function notify(event: { type: string; at: number }): void {
    console.log(event.type, event.at);
}

const debouncedNotify = debounceByKey(notify, (event) => event.type, 1000);

debouncedNotify({ type: 'change', at: 0 });
debouncedNotify({ type: 'update', at: 0 }); // Both execute - different keys
debouncedNotify({ type: 'change', at: 10 }); // Replaces first 'change', only at:10 executes

// Cancel by key or all
debouncedNotify.teardown({ type: 'change', at: 0 });
debouncedNotify.teardownAll();
```

### memo / memoByKey

Memoize function calls - skip execution if arguments haven't changed.

```typescript
import { memo, memoByKey } from '@just-io/utils';

// Basic memo - only calls when extracted values change
function notify(event: { type: string; at: number }): void {
    console.log(event.type, event.at);
}

const memoNotify = memo(notify, (event) => [event.type, event.at]);

memoNotify({ type: 'change', at: 0 }); // Executes
memoNotify({ type: 'change', at: 0 }); // Skipped - same values
memoNotify({ type: 'change', at: 1 }); // Executes - 'at' changed

// Only trigger on changes (skip first call)
function setFilterValue(values: string[]): void {
    console.log('Filters changed:', values);
}

const memoSetFilterValue = memo(setFilterValue, (values) => values, true);

memoSetFilterValue([]); // Skipped (initial call)
memoSetFilterValue(['first']); // Executes (values changed)

// Key-based memo - separate memo state per key
function notifyChannel(channel: string, event: { type: string; at: number }): void {
    console.log(channel, event);
}

const memoNotifyChannel = memoByKey(
    notifyChannel,
    (channel) => channel,
    (channel, event) => [event.type, event.at],
);

memoNotifyChannel('channel1', { type: 'change', at: 0 }); // Executes
memoNotifyChannel('channel2', { type: 'change', at: 0 }); // Executes (different key)
memoNotifyChannel('channel1', { type: 'change', at: 0 }); // Skipped
memoNotifyChannel('channel1', { type: 'change', at: 10 }); // Executes (values changed)

// Key-based with onlyChanges
function setFilter(filter: string, values: string[]): void {
    console.log(filter, values);
}

const memoSetFilter = memoByKey(
    setFilter,
    (filter) => filter,
    (filter, values) => values,
    true,
);

memoSetFilter('filter1', []); // Skipped (initial)
memoSetFilter('filter1', ['1']); // Executes (changed)
```

### DeepMap

Map with array keys (nested key paths). Useful for hierarchical data.

```typescript
import { DeepMap } from '@just-io/utils';

// Create empty or with initial entries
const deepMap = new DeepMap<string, string>();
const withEntries = new DeepMap<string, string>([
    [['one'], 'str'],
    [['one', 'two'], 'str'],
]);

// Copy from another DeepMap
const copy = new DeepMap(withEntries);

// Set and get with array keys
deepMap.set([], 'root'); // Empty key path
deepMap.set(['one'], 'first');
deepMap.set(['one', 'two'], 'nested');

deepMap.get(['one']); // 'first'
deepMap.get(['one', 'two']); // 'nested'
deepMap.get(['missing']); // undefined

// Check existence
deepMap.has(['one']); // true
deepMap.has(['missing']); // false

// Delete entries
deepMap.delete(['one', 'two']); // returns true
deepMap.delete(['missing']); // returns false

// Take: get and delete in one operation
const value = deepMap.take(['one']); // 'first', now deleted
deepMap.take(['missing']); // undefined

// Size and clear
deepMap.size; // number of entries
deepMap.clear(); // remove all

// Iteration
deepMap.forEach((value, key) => console.log(key, value));

for (const [key, value] of deepMap) {
    console.log(key, value);
}

Array.from(deepMap.entries()); // [[key, value], ...]
Array.from(deepMap.keys()); // [key, ...]
Array.from(deepMap.values()); // [value, ...]

// Clone subtree (non-destructive)
deepMap.set(['one'], 'str');
deepMap.set(['one', 'two'], 'str');
const cloned = deepMap.clone(['one']);
// cloned: [[], 'str'], [['two'], 'str']

// Extract subtree (removes from original)
const extracted = deepMap.extract(['one']);
// extracted has the subtree, deepMap no longer has it

// Append entries under a prefix
deepMap.append(['one'], [[['two'], 'str']]);
// Result: [['one', 'two'], 'str']
```

### EventEmitter / Notifier

Type-safe event handling.

```typescript
import { EventEmitter, EventTuple, Notifier } from '@just-io/utils';

// Notifier - single event type
type Event = [first: string, second: string];

const notifier = new Notifier<Event>();

const handler = (first: string, second: string) => console.log(first, second);
notifier.subscribe(handler);
notifier.notify('a', 'b'); // logs: a b

// One-time subscription
notifier.subscribe((a, b) => console.log('once:', a, b), { once: true });
notifier.notify('x', 'y'); // Both handlers called
notifier.notify('x', 'y'); // Only permanent handler

notifier.unsubscribe(handler); // Remove specific
notifier.unsubscribeAll(); // Remove all

// EventEmitter - multiple named events
type EventMap = {
    one: [first: number];
    two: [first: string, second: number];
};

const emitter = new EventEmitter<EventMap>();

emitter.on('one', (first) => console.log('one:', first));
emitter.on('two', (first, second) => console.log('two:', first, second));

emitter.emit('one', 1);
emitter.emit('two', '1', 2);

// One-time listener
emitter.once('one', (first) => console.log('once:', first));

// Emit from tuple (useful for batching)
type ETuple = EventTuple<EventMap>;
const events: ETuple[] = [
    ['one', 1],
    ['two', '2', 1],
];
for (const event of events) {
  emitter.emit(...event);
}

// Unsubscribe
emitter.off('one', handler);
emitter.unsubscribeAll('one'); // Remove all 'one' handlers
emitter.unsubscribeAll(); // Remove all handlers

// Event store - batch events and emit later
const store = emitter.makeStore();
store.add('one', 1);
store.add('one', 2);
store.emit(); // Emits both events
store.emit(); // Does nothing (already emitted)
```

## License

MIT
