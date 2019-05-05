'use strict';

const { Events, EventListener } = require('../communication/Events.js');

class Vision {
  constructor(dustbin) {
    this._handleVisionResponse = this._handleVisionResponse.bind(this);
    this.DUSTBIN = dustbin;
    this._subscribeListeners();
  }
  _subscribeListeners() {
    this.DUSTBIN.subscribe(new EventListener(Events.VISION_RESPONSE_RECEIVED, this._handleVisionResponse));
  }
  _handleVisionResponse(kwargs) {
    const { success, answer, what } = kwargs;
    if (what == 'person') {
      if (!success) {
        this.DUSTBIN.trigger(Events.PERSON_NOT_IDENTIFIED);
        this.DUSTBIN.trigger(Events.SPEAK, { message: 'Sorry, I don\'t know who that is.' });
      } else {
        this.DUSTBIN.trigger(Events.PERSON_IDENTIFIED, { person: answer });
        this.DUSTBIN.trigger(Events.SPEAK, { message: `That's ${answer}.` });
      }
    } else if (what == 'object') {
      if (!success) {
        this.DUSTBIN.trigger(Events.OBJECT_NOT_IDENTIFIED);
        this.DUSTBIN.trigger(Events.SPEAK, { message: 'Sorry, I don\'t know what that is.' });
      } else {

        this.DUSTBIN.trigger(Events.OBJECT_IDENTIFIED, { person: answer });
        this.DUSTBIN.trigger(Events.SPEAK, { message: `That's a ${answer}.` });
      }
    }
  }
}

module.exports = {
  Vision
}