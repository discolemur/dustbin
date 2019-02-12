'use strict';

// TODO use async.doWhilst or something else rather than all the crazy stuff I've got set up so far.

const { Events, EventListener } = require('../communication/Events.js');
const Objects = require('./Vision.js');

class FindObjectListener extends EventListener {
  callback(kwargs) {
    return this.container._handleFindObject(kwargs.obj);
  }
}
class IdentifyObjectListener extends EventListener {
  callback(kwargs) {
    return this.container._handleIdentifyObject(kwargs.obj);
  }
}
class FindPersonListener extends EventListener {
  callback(kwargs) {
    return this.container._handleFindPerson(kwargs.person);
  }
}
class IdentifyPersonListener extends EventListener {
  callback(kwargs) {
    return this.container._handleIdentifyPerson(kwargs.pronoun);
  }
}

class Vision {
  constructor(dustbin) {
    this.known_people = [];
    this.known_objects = [];
    this.DUSTBIN = dustbin;
    this._subscribeListeners();
  }

  // ''' HANDLERS '''
  _handleFindObject(obj) {
    this.DUSTBIN.log('Find object is not yet implemented.');
    this.DUSTBIN.trigger(Events.OBJECT_FOUND, {obj : obj});
  }
  _handleIdentifyObject(obj) {
    this.DUSTBIN.log('Identify object is not yet implemented.');
    this.DUSTBIN.trigger(Events.OBJECT_IDENTIFIED, {obj : obj});
  }
  _handleFindPerson(person) {
    this.DUSTBIN.log('Find person is not yet implemented.');
    this.DUSTBIN.trigger(Events.PERSON_FOUND, {person : person});
  }
  _handleIdentifyPerson(pronoun) {
    this.DUSTBIN.log('Identify person is not yet implemented.');
    this.DUSTBIN.trigger(Events.PERSON_IDENTIFIED, {person : pronoun});
  }

  // ''' METHODS '''
  _subscribeListeners() {
    this.FOL = new FindObjectListener(this);
    this.IOL = new IdentifyObjectListener(this);
    this.FPL = new FindPersonListener(this);
    this.IPL = new IdentifyPersonListener(this);
    this.DUSTBIN.subscribe(Events.REQ_FIND_OBJECT, this.FOL);
    this.DUSTBIN.subscribe(Events.REQ_IDENTIFY_OBJECT, this.IOL);
    this.DUSTBIN.subscribe(Events.REQ_FIND_PERSON, this.FPL);
    this.DUSTBIN.subscribe(Events.REQ_IDENTIFY_PERSON, this.IPL);
  }
  stop() {
    this.DUSTBIN.log('ENDING VISION THREAD');
  }
  run() {
    try {
      async.doWhilst(()=>{
        setTimeout(()=>{
          this.DUSTBIN.log('Vision process continues.');
        }, 4000)
      }, this.DUSTBIN.keepGoing);
    } catch(e) {
      this.DUSTBIN.log('Vision process had fatal error.', e);
      print('Vision process had fatal error.', e);
    }
    this.DUSTBIN.log('VISION OFFICIALLY DEAD.');
  }
}

module.exports = {
  FindObjectListener,
  IdentifyObjectListener,
  FindPersonListener,
  IdentifyPersonListener,
  Vision
}