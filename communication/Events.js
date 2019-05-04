/*
Events Class

Defines global variables representing which events can trigger callbacks.
*/

const SocketCom = require('./SocketCom');

// TODO fill in the vision communication code and appropriately handle communications.

const uuid = require('uuid');
/**
 * The EventListener class holds an ID and a callback. It also keeps track of how many times it has been called (for testing purposes).
 * NOTE: For some reason, if the callback includes any variable defined outside the function, it must be given by the ()=>this.fn() format.
 * Example: new EventListener(Events.SPEAK, (kwargs)=>this._handleSpeak(kwargs))
 * @class EventListener
 */
class EventListener {
  constructor(_event, _callback) {
    this._hash = uuid();
    this.event = _event;
    this.callCount = 0;
    this.callback = _callback;
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
  REQ_SHUTDOWN: 0,
  REQ_IDENTIFY_PERSON: 1,
  REQ_IDENTIFY_OBJECT: 2,
  PERSON_IDENTIFIED: 3,
  OBJECT_IDENTIFIED: 4,
  PERSON_NOT_IDENTIFIED: 5,
  OBJECT_NOT_IDENTIFIED: 6,
  NOT_UNDERSTAND_MSG: 7,
  REQ_FOLLOW: 8,
  GO_WAIT: 9,
  INTRODUCE_ROBOT: 10,
  GREETINGS: 11,
  HEARD_YES: 12,
  HEARD_NO: 13,
  REQ_FIND_PERSON: 14,
  REQ_FIND_OBJECT: 15,
  PERSON_FOUND: 16,
  OBJECT_FOUND: 17,
  PERSON_NOT_FOUND: 18,
  OBJECT_NOT_FOUND: 19,
  INTERPRETED_AUDIO: 20,
  UNDERSTAND_MSG: 21,
  INTERPRETED_TEXT: 22,
  // REQUIRED ARGS: 'message'=string
  SPEAK: 23,
  RESPONSE_NO: 24,
  RESPONSE_YES: 25,
  REQ_WIGGLE: 26,
  REQ_FIGURE_EIGHT: 27,
  REQ_SPIN: 28,
  ROBOT_MOVED: 29,
  ROBOT_FOLLOWING: 30,
  ROBOT_WAITING: 31,
  VISION_RESPONSE_RECEIVED: 32,

  _NEXT_KEY: 33
};

let EventsByNumber = {};
for (let event of Object.keys(Events)) {
  EventsByNumber[Events[event]] = event;
}

/**
 * The MyEventEmitter class is a replacement for the standard nodejs EventEmitter
 * @class MyEventEmitter
 */
class MyEventEmitter {
  constructor() {
    this.callbacks = {};
    this.socketCommunicator = SocketCom();
    this.socketCommunicator.setResponseHandler(this.handleVisionResponse);
    const self = this;
    this.socketCommunicator.ready().then(()=>{
      self.subscribe(new EventListener(Events.REQ_FIND_OBJECT, (kwargs)=>self.sendVisionRequest({find : kwargs.object})))
      self.subscribe(new EventListener(Events.REQ_IDENTIFY_OBJECT, (kwargs)=>self.sendVisionRequest(kwargs)));
      self.subscribe(new EventListener(Events.REQ_FIND_PERSON, (kwargs)=>self.sendVisionRequest({find : kwargs.person})));
      self.subscribe(new EventListener(Events.REQ_IDENTIFY_PERSON, (kwargs)=>self.sendVisionRequest(kwargs)));
    })
  }
  done(testing=false) {
    if (!testing) {
      this.sendVisionRequest({request : "die"})
    }
  }
  handleVisionResponse(msg) {
    this.emit(Events.VISION_RESPONSE_RECEIVED, msg)
  }
  sendVisionRequest(jsonMsg, requireResponse=false) {
    //request('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', { json: true }, (err, res, body) => {
    //  if (err) { return console.log(err); }
    //  console.log(body.url);
    //  console.log(body.explanation);
    //});
    this.socketCommunicator.send(JSON.stringify(jsonMsg), requireResponse);
  }
  /**
   * Subscribes a listener.
   * Returns an unsubcribe function.
   * @param {*} listener 
   */
  subscribe(listener) {
    const event = listener.event;
    if (this.callbacks[event] === undefined) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(listener)
    let self = this;
    return () => { self.callbacks[event] = self.callback[event].filter(x => x != listener) };
  }
  emit(event, kwargs = null) {
    if (this.callbacks[event] === undefined) {
      return Promise.resolve();
    }
    return Promise.all(this.callbacks[event].map(x => x.runCallback(kwargs)));
  }
}

module.exports = {
  'Events': Events,
  'EventListener': EventListener,
  'EventsByNumber': EventsByNumber,
  'MyEventEmitter': MyEventEmitter
};