'use strict';

/*
  Switchboard Class
  The main switchboard for the project, managing callbacks when events occur.
*/

const {Events, EventListener} = require('./Events.js');
const Queue = require('../Queue.js');

class Switchboard {
  constructor(_DUSTBIN) {
    this.switchboard = {};
    for (let k of Object.values(Events)) {
      this.switchboard[k] = {};
    }
    this.toTrigger = new Queue(); 
    this.DUSTBIN = _DUSTBIN;
    this.keepGoing = true;
  }
  stop() {
    this.DUSTBIN.log('ENDING SWITCHBOARD THREAD');
    this.keepGoing = false;
    // Let's try to fix this so that we don't need some dumb extra null in the queue.
    this.toTrigger.put({event: null, kwargs: null});
  } 
  // Returns unsubscribe function.
  subscribe(event, listener, callback=null) {
    this.DUSTBIN.log(`Setting callback to event ${event}`);
    this.switchboard[event][listener.getHash()] = listener;
    if (callback) {
      callback();
    }
    return ()=>{this.swithcboard = this.switchboard.filter(l => l != listener)}
  }
  
  runTrigger(_event, _kwargs) {
    this.toTrigger.put({event: _event, kwargs: _kwargs});
  }
  _triggerEvent(event, kwargs) {
    if (!event && !kwargs) {
      return;
    }
    this.DUSTBIN.log(`Event ${event} triggered.`)
    for (let listener in Object.values(this.switchboard[event])) {
      try {
        listener.runCallback(kwargs);
      }
      catch (e) {
        // Program should not die.
        this.DUSTBIN.log('EXCEPTION IN CALLBACK FOR EVENT', e, e.message);
        continue;
      }
    }
  }
  run() {
    try {
      while (this.keepGoing) {
        this.DUSTBIN.log('Switchboard process continues.');
        let {event, kwargs} = this.toTrigger.pop();
        this._triggerEvent(event, kwargs);
      }
    } catch (e) {
      this.DUSTBIN.log('Switchboard process had a fatal error.', e);
      console.log('Switchboard process had a fatal error.', e);
    }
    this.DUSTBIN.log('SWITCHBOARD OFFICIALLY DEAD.');
  }
}

module.exports = Switchboard;