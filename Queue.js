'use strict';

class Queue {
  constructor(_size = -1) {
    this.max = _size;
    this.queue = [];
  }
  empty() {
      return this.queue.length == 0;
  }
  full() {
    return this.max <= this.queue.length;
  }
  pop() {
    if (this.queue.length == 0) {
      return null;
    }
    let rv = this.queue[0];
    this.queue = this.queue.splice(1, this.queue.length);
    return rv;
  }
  put(val) {
    let didPut = false;
    if (this.max > this.queue.length) {
        this.queue.push(val);
        didPut = true;
    }
    return didPut;
  }
}

module.exports = Queue;