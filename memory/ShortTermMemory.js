'use strict';

const { Events, EventListener } = require('../communication/Events.js');
const Queue = require('../Queue.js');

const MSG_MEM_SIZE = 10;

/*
    This class holds :
        - recent messages
    
    TODO:
        - locations of objects
        - map of area where robot has moved
*/

class MessageListener extends EventListener {
  callback(kwargs) {
    return this.container.addMessage(kwargs.query, kwargs.response, kwargs.action);
  }
}

class ShortTermMemory {
  constructor(dustbin) {
    this.DUSTBIN = dustbin;
    this._recentMessages = new Queue(MSG_MEM_SIZE);
    this.messageListener = new MessageListener(this);
    this.DUSTBIN.subscribe(Events.UNDERSTAND_MSG, this.messageListener);
    this.DUSTBIN.subscribe(Events.NOT_UNDERSTAND_MSG, this.messageListener);
  }

  getRecentMessages() {
    return Array.from(this._recentMessages.queue);
  }

  addMessage(_query, _response, _action) {
    if (this._recentMessages.full()) {
      this._recentMessages.pop();
    }
    this._recentMessages.put({query: _query, response: _response, action: _action});
  }
}

module.exports = {
    MessageListener,
    ShortTermMemory
}