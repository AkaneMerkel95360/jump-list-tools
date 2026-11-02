// Core implementation of a sorted linked list with skip pointers.
// The skip list is deterministic: the level of each new node is chosen
// using a simple counter that cycles through a fixed pattern. This avoids
// randomness (which would make tests non-deterministic) while still
// providing logarithmic average-case search and insertion.

const MAX_LEVEL = 16; // Enough for 2^16 = 65536 nodes; adjust if needed.

/**
 * A node in the skip list.
 * @template T
 */
class Node {
  /**
   * @param {T} value
   * @param {number} level
   */
  constructor(value, level) {
    this.value = value;
    /** @type {Node<T>[]} */
    this.next = new Array(level).fill(null);
  }
}

/**
 * A sorted linked list augmented with skip pointers to support
 * logarithmic search and insertion.
 *
 * The list maintains a deterministic level assignment: the first inserted
 * node gets level 1, the second level 2, ..., up to MAX_LEVEL, then the
 * pattern repeats. This yields a balanced structure on average and makes
 * the behaviour reproducible in tests.
 *
 * @template T
 */
export class SkipList {
  /**
   * @param {(a: T, b: T) => number} compare - Comparator returning negative,
   *   zero, or positive. Required because the list must be sorted.
   */
  constructor(compare) {
    if (typeof compare !== 'function') {
      throw new TypeError('compare must be a function');
    }
    this.compare = compare;
    this.head = new Node(null, MAX_LEVEL);
    this.level = 0; // current highest level in use (0 means empty)
    this._insertCount = 0; // used to pick deterministic levels
    this._size = 0;
  }

  /**
   * Number of elements in the list.
   * @returns {number}
   */
  get size() {
    return this._size;
  }

  /**
   * Returns the next level for a new node based on a deterministic cycle.
   * The cycle is 1, 2, ..., MAX_LEVEL, 1, 2, ... This gives a roughly
   * balanced distribution without randomness.
   * @returns {number}
   * @private
   */
  _nextLevel() {
    const lvl = (this._insertCount % MAX_LEVEL) + 1;
    this._insertCount++;
    return lvl;
  }

  /**
   * Inserts a value into the list, keeping it sorted.
   * Duplicate values are allowed and placed after existing equal elements.
   * @param {T} value
   */
  insert(value) {
    /** @type {Node<T>[]} */
    const update = new Array(MAX_LEVEL).fill(null);
    let current = this.head;

    // Find the insertion point at each level.
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] !== null && this.compare(current.next[i].value, value) < 0) {
        current = current.next[i];
      }
      update[i] = current;
    }

    // Determine the level for the new node.
    const newLevel = this._nextLevel();
    if (newLevel > this.level) {
      // For levels above the current maximum, the update point is the head.
      for (let i = this.level; i < newLevel; i++) {
        update[i] = this.head;
      }
      this.level = newLevel;
    }

    const newNode = new Node(value, newLevel);
    for (let i = 0; i < newLevel; i++) {
      newNode.next[i] = update[i].next[i];
      update[i].next[i] = newNode;
    }
    this._size++;
  }

  /**
   * Searches for a value using the skip pointers.
   * @param {T} value
   * @returns {boolean} true if found, false otherwise.
   */
  contains(value) {
    let current = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] !== null && this.compare(current.next[i].value, value) < 0) {
        current = current.next[i];
      }
    }
    current = current.next[0];
    return current !== null && this.compare(current.value, value) === 0;
  }

  /**
   * Returns the value at the given index (0-based).
   * Throws if index is out of range.
   * @param {number} index
   * @returns {T}
   */
  get(index) {
    if (index < 0 || index >= this._size) {
      throw new RangeError('index out of bounds');
    }
    let current = this.head.next[0];
    for (let i = 0; i < index; i++) {
      current = current.next[0];
    }
    return current.value;
  }

  /**
   * Returns an array of all values in sorted order.
   * @returns {T[]}
   */
  toArray() {
    const result = [];
    let current = this.head.next[0];
    while (current !== null) {
      result.push(current.value);
      current = current.next[0];
    }
    return result;
  }

  /**
   * Removes the first occurrence of a value.
   * @param {T} value
   * @returns {boolean} true if removed, false if not found.
   */
  remove(value) {
    /** @type {Node<T>[]} */
    const update = new Array(MAX_LEVEL).fill(null);
    let current = this.head;

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] !== null && this.compare(current.next[i].value, value) < 0) {
        current = current.next[i];
      }
      update[i] = current;
    }

    current = current.next[0];
    if (current === null || this.compare(current.value, value) !== 0) {
      return false;
    }

    // Remove the node from all levels it appears in.
    for (let i = 0; i < this.level; i++) {
      if (update[i].next[i] === current) {
        update[i].next[i] = current.next[i];
      }
    }

    // Adjust the list level if the top levels are now empty.
    while (this.level > 0 && this.head.next[this.level - 1] === null) {
      this.level--;
    }

    this._size--;
    return true;
  }
}
