'use strict';

const { Events, EventListener, MyEventEmitter } = require('./communication/Events.js');
const AudioCommunicator = require('./communication/AudioCommunicator.js').AudioCommunicator;
const ShortTermMemory = require('./memory/ShortTermMemory.js').ShortTermMemory;
const Robot = require(`${__dirname}/robot/Robot.js`);
const Vision = require(`${__dirname}/machine_learning/Vision.js`).Vision;

/**
 * Dustbin Class
 * Dustbin is the main wrapper class for the robot. It coordinates the vision, memory, speech, and movement components.
 * Holds global variables and global methods.
 * @module Dustbin
 * @namespace Dustbin
 * @class Dustbin
 * @classdesc This is a description of the MyClass class.
 */
class Dustbin {
  /**
   * 
   * @param {*} _logger Logger class instance.
   * @param {*} audio_timeout Time waiting for audio before giving up and trying to interpret.
   * @param {*} silent If silent is true, then will not play audio. Otherwise, will speak back responses.
   */
  constructor(_logger, audio_timeout, silent, _testing=false) {
    this.testing = _testing;
    this._lastCheck = Date.now();
    this.logger = _logger;
    this.log('-------------------DUSTBIN BEGINS-------------------');
    this.keepGoing = true;
    this.ended = false;
    this._REFRESH_RATE = 60;
    this.silent = silent;
    this.switchboard = new MyEventEmitter();
    try {
      // # Then need a communicator
      this.com = new AudioCommunicator(audio_timeout, this);
      // # Then short term memory
      this.memory = new ShortTermMemory(this);
      // # Finally can add a robot
      this.robot = new Robot(this);
      // this.robotThread = Thread(target = this.robot.run);
      // this.robotThread.start();
      this.vision = new Vision(this);
      // this.visionThread = Thread(target = this.vision.run);
      // this.visionThread.start();
      // # End by subscribing to shutdown
      this.subscribe(new EventListener(Events.REQ_SHUTDOWN, (kwargs)=>this.done(kwargs)));
    } catch (e) {
      console.log('FATAL ERROR OCCURRED DURING SETUP!', e);
      this.done();
    }
  }
  /**
   * Tests for an internet connection.
   * Returns a Promise which resolves/rejects boolean true/false.
   */
  _testInternetPromise() {
    return new Promise(function (resolve, reject) {
      require('dns').resolve('www.google.com', function (err) {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    })
  }
  /**
   * Calls the Logger.log function. See Logger.log
   */
  log() {
    this.logger.log(arguments);
  }
  /**
   * Subscribes an EventListener
   * @param {*} listener Listener object, includes callback for the triggered event.
   */
  subscribe(listener) {
    return this.switchboard.subscribe(listener);
  }
  
  /**
   * Returns a Promise.
   * This tells the Dustbin that it's time to stop.
   */
  done(testing=false) {
    if (this.ended) { return; }
    this.keepGoing = false;
    const self = this;
    if (self.robot)
      self.robot.end();
    self.log('-------------------DUSTBIN   ENDS-------------------');
    self.logger.end();
    self.ended = true;
    if (!testing) {
      process.exit(0);
    }
    return Promise.resolve();
  }
  /**
   * Tests whether or not internet is connected, as long as it has been enough time since last checked.
   * Updates this._hasInternet flag accordingly.
   */
  testInternet() {
    // After REFRESH_RATE seconds, should check again for internet connection
    if ((Date.now() - this._lastCheck) > this._REFRESH_RATE) {
      let self = this;
      this._testInternetPromise().then(i => { self._hasInternet = i });
      this._lastCheck = Date.now();
    }
    return this._hasInternet;
  }
  /**
   * Persistent Dustbin run loop. Checks for internet if is not connected. Interprets audio, then handles response.
   */
  run() {
    try {
      while (this.keepGoing) {
        if (!this._hasInternet) {
          this.testInternet();
        }
        setTimeout(() => {
          this.com.interpretAudio().then(response => {
            // TODO is this even necessary, or do we handle it in interpret audio instead?
          })
          this.log('Listening process continues.');
          // TODO is the timeout necessary if we are already waiting while getting audio?
        }, 500);
      }
      this.done();
    }
    catch (e) {
      this.log('Dustbin process had fatal error.', e);
      console.log('Dustbin process had fatal error.', e);
      return this.done();
    }
  }
  /**
   * Returns MyEventEmitter.emit (which is a Promise.all for all listeners triggered)
   * @param {*} event Integer for the event to trigger.
   * @param {*} kwargs Arguments to pass to all listeners for this event.
   */
  trigger(event, kwargs = {}) {
    kwargs.event = event;
    return this.switchboard.emit(event, kwargs);
  }
  /**
   * Rather than running persistently, the dustbin will run a list of commands in sequence. This is primarily for testing purposes.
   * @param {*} commands List of commands to interpret. Each command is interpretted separately.
   */
  runCommands(commands) {
    let promise = Promise.resolve();
    for (const command of commands) {
      if (command.indexOf('.wav') != -1) {
        promise = promise.then(() => { return this.com.interpretFromWavFile(command); });
      }
      else {
        promise = promise.then(() => { return this.com.interpretText(command); });
      }
    }
    return promise;
  }
}

module.exports = Dustbin;