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

class ShortTermMemory {
  constructor(dustbin) {
    this.DUSTBIN = dustbin;
    this._recentMessages = new Queue(MSG_MEM_SIZE);
    this.DUSTBIN.subscribe(new EventListener(Events.UNDERSTAND_MSG, (kwargs)=>this.addMessage(kwargs.query, kwargs.response, kwargs.action)));
    this.DUSTBIN.subscribe(new EventListener(Events.NOT_UNDERSTAND_MSG, (kwargs)=>this.addMessage(kwargs.query, kwargs.response, kwargs.action)));
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
    ShortTermMemory
}