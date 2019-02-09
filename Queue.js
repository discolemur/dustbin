'use strict';

class Queue {
  constructor(_size = -1) {
    this.max = _size;
    this.queue = [];
    this.itemAddedCallback = ()=>{};
  }
  subscribeToAdd(callback) {
    this.itemAddedCallback = callback;
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
    return this.queue.pop();
  }
  put(val) {
    let didPut = false;
    if (this.max > this.queue.length) {
        this.queue.unshift(val);
        didPut = true;
    }
    this.itemAddedCallback();
    return didPut;
  }
}

module.exports = Queue;