/*
Events Class

Defines global variables representing which events can trigger callbacks.
*/

const config = require(`${__dirname}/../config.json`);
var mqtt = require('mqtt')

// TODO fill in the vision communication code and appropriately handle communications.
// Use mosquitto as a localhost mqtt server
// To test mosquitto, use these commands in separate terminals:
/*
    # Set up reporter
    mosquitto_sub -h test.mosquitto.org -t "hello/world" -v
    # Broadcast a message (reporter should receive it)
    mosquitto_pub -h test.mosquitto.org -t "hello/world" -m "Who's there"
*/

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
    this.setupMQTT();
    this.subscribe(new EventListener(Events.REQ_FIND_OBJECT, (kwargs)=>this.publishVisionMQTT({find : kwargs.object})))
    this.subscribe(new EventListener(Events.REQ_IDENTIFY_OBJECT, (kwargs)=>this.publishVisionMQTT(kwargs)));
    this.subscribe(new EventListener(Events.REQ_FIND_PERSON, (kwargs)=>this.publishVisionMQTT({find : kwargs.person})));
    this.subscribe(new EventListener(Events.REQ_IDENTIFY_PERSON, (kwargs)=>this.publishVisionMQTT(kwargs)));
  }
  done(testing=false) {
    if (!testing) {
      this.publishVisionMQTT({request : "die"})
    }
    this.client.end()
  }
  setupMQTT() {
    this.client = mqtt.connect(`mqtt://${config.mqtt_host}:${config.mqtt_port}`);
    let self = this;
    this.client.on('connect', function () {
      self.client.subscribe(config.mqtt_vision_response, function (err) {
        if (err) {
          throw new Error(`Failed to subscribe to ${config.mqtt_vision_response}`)
        }
      });
    })
    this.client.on('message', this.handleMQTTMessage)
  }
  handleMQTTMessage(topic, message) {
    console.log(`Received message on ${topic}.`);
    const msg = JSON.parse(message.toString());
    this.emit(Events.VISION_RESPONSE_RECEIVED, msg)
  }
  publishVisionMQTT(jsonMsg) {
    if (!this.client.connected) {
      throw new Error("Cannot send a message if MQTT is not ready!");
    }
    this.client.publish(config.mqtt_vision_request, JSON.stringify(jsonMsg));
    // TODO wait for response
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
      return;
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