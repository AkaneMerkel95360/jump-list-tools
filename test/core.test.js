import test from 'node:test';
import assert from 'node:assert/strict';
import { SkipList } from '../src/index.js';

// Helper comparator for numbers.
const numCompare = (a, b) => a - b;

test('empty list', () => {
  const list = new SkipList(numCompare);
  assert.equal(list.size, 0);
  assert.deepEqual(list.toArray(), []);
  assert.equal(list.contains(5), false);
});

test('insert and contains', () => {
  const list = new SkipList(numCompare);
  list.insert(3);
  list.insert(1);
  list.insert(2);
  assert.equal(list.size, 3);
  assert.equal(list.contains(1), true);
  assert.equal(list.contains(2), true);
  assert.equal(list.contains(3), true);
  assert.equal(list.contains(4), false);
});

test('toArray returns sorted order', () => {
  const list = new SkipList(numCompare);
  const values = [5, 2, 8, 1, 9, 3];
  for (const v of values) list.insert(v);
  assert.deepEqual(list.toArray(), [1, 2, 3, 5, 8, 9]);
});

test('duplicates are allowed and kept in order', () => {
  const list = new SkipList(numCompare);
  list.insert(2);
  list.insert(2);
  list.insert(1);
  assert.deepEqual(list.toArray(), [1, 2, 2]);
  assert.equal(list.size, 3);
});

test('get by index', () => {
  const list = new SkipList(numCompare);
  [10, 20, 30].forEach(v => list.insert(v));
  assert.equal(list.get(0), 10);
  assert.equal(list.get(1), 20);
  assert.equal(list.get(2), 30);
  assert.throws(() => list.get(3), RangeError);
  assert.throws(() => list.get(-1), RangeError);
});

test('remove existing value', () => {
  const list = new SkipList(numCompare);
  list.insert(1);
  list.insert(2);
  list.insert(3);
  assert.equal(list.remove(2), true);
  assert.deepEqual(list.toArray(), [1, 3]);
  assert.equal(list.size, 2);
  assert.equal(list.contains(2), false);
});

test('remove non-existent value', () => {
  const list = new SkipList(numCompare);
  list.insert(1);
  assert.equal(list.remove(2), false);
  assert.equal(list.size, 1);
});

test('remove from empty list', () => {
  const list = new SkipList(numCompare);
  assert.equal(list.remove(5), false);
});

test('remove first and last', () => {
  const list = new SkipList(numCompare);
  [1, 2, 3].forEach(v => list.insert(v));
  assert.equal(list.remove(1), true);
  assert.deepEqual(list.toArray(), [2, 3]);
  assert.equal(list.remove(3), true);
  assert.deepEqual(list.toArray(), [2]);
});

test('string values with custom comparator', () => {
  const cmp = (a, b) => a.localeCompare(b);
  const list = new SkipList(cmp);
  list.insert('banana');
  list.insert('apple');
  list.insert('cherry');
  assert.deepEqual(list.toArray(), ['apple', 'banana', 'cherry']);
});

test('insert many and search', () => {
  const list = new SkipList(numCompare);
  const n = 100;
  for (let i = 0; i < n; i++) {
    list.insert((i * 37) % n); // pseudo-random but deterministic
  }
  assert.equal(list.size, n);
  for (let i = 0; i < n; i++) {
    assert.equal(list.contains(i), true, `missing ${i}`);
  }
  assert.equal(list.contains(n), false);
});

test('remove all elements', () => {
  const list = new SkipList(numCompare);
  for (let i = 0; i < 10; i++) list.insert(i);
  for (let i = 0; i < 10; i++) {
    assert.equal(list.remove(i), true);
  }
  assert.equal(list.size, 0);
  assert.deepEqual(list.toArray(), []);
});
