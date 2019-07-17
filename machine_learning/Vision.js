'use strict';

const { Events, EventListener } = require('../communication/Events.js');

class Vision {
  constructor(dustbin) {
    this._handleVisionResponse = this._handleVisionResponse.bind(this);
    this.DUSTBIN = dustbin;
    this._subscribeListeners();
  }
  _subscribeListeners() {
    return this.DUSTBIN.subscribe(new EventListener(Events.VISION_RESPONSE_RECEIVED, this._handleVisionResponse));
  }
  _handleVisionResponse(kwargs) {
    const { success, answer, what } = kwargs;
    let promise = Promise.resolve();
    if (what == 'person') {
      if (!success) {
        promise = promise.then(()=>this.DUSTBIN.trigger(Events.PERSON_NOT_IDENTIFIED));
        promise = promise.then(()=>this.DUSTBIN.trigger(Events.SPEAK, { message: 'Sorry, I don\'t know who that is.' }));
      } else {
        promise = promise.then(()=>this.DUSTBIN.trigger(Events.PERSON_IDENTIFIED, { person: answer }));
        promise = promise.then(()=>this.DUSTBIN.trigger(Events.SPEAK, { message: `That's ${answer}.` }));
      }
    } else if (what == 'object') {
      if (!success) {
        promise = promise.then(()=>this.DUSTBIN.trigger(Events.OBJECT_NOT_IDENTIFIED));
        promise = promise.then(()=>this.DUSTBIN.trigger(Events.SPEAK, { message: 'Sorry, I don\'t know what that is.' }));
      } else {
        promise = promise.then(()=>this.DUSTBIN.trigger(Events.OBJECT_IDENTIFIED, { person: answer }));
        promise = promise.then(()=>this.DUSTBIN.trigger(Events.SPEAK, { message: `That's a ${answer}.` }));
      }
    }
    return promise;
  }
}

module.exports = {
  Vision
}