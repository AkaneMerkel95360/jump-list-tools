# jump-list-tools

A sorted linked list with skip pointers for logarithmic search and insertion.

```js
import { SkipList } from 'jump-list-tools';

const list = new SkipList((a, b) => a - b);
list.insert(3);
list.insert(1);
list.insert(2);
console.log(list.toArray()); // [1, 2, 3]
console.log(list.contains(2)); // true
console.log(list.get(0)); // 1
list.remove(2);
console.log(list.toArray()); // [1, 3]
```

## Why this exists

A plain sorted linked list gives O(n) search. Adding skip pointers — forward
links at multiple levels — brings average search and insertion down to
O(log n). The trade-off is extra memory for the forward pointers and a more
complex insertion routine. This library uses a deterministic level assignment
(cycling 1..16) instead of randomness so that behaviour is reproducible and
tests never flake.

## Edge case

The list requires a comparator function. If you pass values that the
comparator cannot order (e.g., mixing types), the list may become unsorted
and searches will fail. Always use a comparator consistent with your value
type. Duplicate values are allowed and are kept in insertion order among
equals.
