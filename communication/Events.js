/*
Events Class

Defines global variables representing which events can trigger callbacks.
*/

const uuid = require('uuid');

class EventListener {
  constructor(container) {
    this._hash = uuid();
    this.callCount = 0;
    this.container = container;
  }
  getHash() {
    return this._hash;
  }
  callback(kwargs) { }
  async runCallback(kwargs) {
    this.callCount++;
    let self = this;
    await Promise.resolve();
    return self.callback(kwargs);
  }
}

const Events = {
  REQ_SHUTDOWN : 0,
  REQ_IDENTIFY_PERSON : 1,
  REQ_IDENTIFY_OBJECT : 2,
  PERSON_IDENTIFIED : 3,
  OBJECT_IDENTIFIED : 4,
  PERSON_NOT_IDENTIFIED : 5,
  OBJECT_NOT_IDENTIFIED : 6,
  NOT_UNDERSTAND_MSG : 7,
  REQ_FOLLOW : 8,
  GO_WAIT : 9,
  INTRODUCE_ROBOT : 10,
  GREETINGS : 11,
  HEARD_YES : 12,
  HEARD_NO : 13,
  REQ_FIND_PERSON : 14,
  REQ_FIND_OBJECT : 15,
  PERSON_FOUND : 16,
  OBJECT_FOUND : 17,
  PERSON_NOT_FOUND : 18,
  OBJECT_NOT_FOUND : 19,
  INTERPRETED_AUDIO : 20,
  UNDERSTAND_MSG : 21,
  INTERPRETED_TEXT : 22,
  // REQUIRED ARGS: 'message'=string
  SPEAK : 23,
  RESPONSE_NO : 24,
  RESPONSE_YES : 25,
  REQ_WIGGLE : 26,
  REQ_FIGURE_EIGHT : 27,
  REQ_SPIN : 28,
  ROBOT_MOVED : 29,
  ROBOT_FOLLOWING: 30,
  ROBOT_WAITING: 31,

  _NEXT_KEY : 32
};

let EventsByNumber = {};
for (let event of Object.keys(Events)) {
  EventsByNumber[Events[event]] = event;
}

class EventEmitter {
  constructor() {
    this.callbacks = {};
  }
  /**
   * Subscribes a listener.
   * Returns an unsubcribe function.
   * @param {*} event 
   * @param {*} listener 
   */
  subscribe(event, listener) {
    if (this.callbacks[event] === undefined) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(listener)
    let self = this;
    return ()=>{self.callbacks[event] = self.callback[event].filter(x => x != listener)};
  }
  emit(event, kwargs = null) {
    if (this.callbacks[event] === undefined) {
      return;
    }
    return Promise.all(this.callbacks[event].map(x => x.runCallback(kwargs)));
  }
}

module.exports = {
  'Events': Events,
  'EventListener': EventListener,
  'EventsByNumber': EventsByNumber,
  'EventEmitter': EventEmitter
};