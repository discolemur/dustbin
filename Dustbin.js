'use strict';
/*
  Dustbin Class
    Connects all other components.
    Holds global variables and global methods.
*/

const { Events, EventListener, EventEmitter } = require('./communication/Events.js');
const { Communicator, SpeakListener } = require('./communication/Communicator.js');
const { ShortTermMemory, MessageListener } = require('./memory/ShortTermMemory.js');
const Robot = require('./robot/Robot.js');

const { Vision } = require('./machine_learning/Vision.js');

// from machine_learning.Vision import Vision
// from threading import Thread

function _testInternet() {
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

class ShutdownListener extends EventListener {
  callback() {
    return this.container.done()
  }
}

class Dustbin {
  constructor(_logger, audio_timeout, silent) {
    this._lastCheck = Date.now();
    this.logger = _logger;
    this.log('-------------------DUSTBIN BEGINS-------------------');
    this.keepGoing = true;
    this.ended = false;
    this._REFRESH_RATE = 60;
    this.silent = silent;
    this.switchboard = new EventEmitter();
    try {
      // # Then need a communicator
      this.com = new Communicator(audio_timeout, this);
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
      this.shutdownListener = new ShutdownListener(this);
      this.subscribe(Events.REQ_SHUTDOWN, this.shutdownListener);
    } catch (e) {
      console.log('FATAL ERROR OCCURRED DURING SETUP!', e);
      this.done();
      process.exit(1);
    }
  }
  log() {
    this.logger.log(arguments);
  }
  subscribe(event, listener) {
    return this.switchboard.subscribe(event, listener);
  }
  done() {
    if (this.ended) { return; }
    this.keepGoing = false;
    if (this.robot)
      this.robot.end();
    if (this.vision)
      this.vision.stop();
    this.log('-------------------DUSTBIN   ENDS-------------------');
    this.logger.end();
    this.ended = true;
  }
  testInternet() {
    // After REFRESH_RATE seconds, should check again for internet connection
    if ((Date.now() - this._lastCheck) > this._REFRESH_RATE) {
      let self = this;
      _testInternet().then(i => { self._hasInternet = i });
      this._lastCheck = Date.now();
    }
    return this._hasInternet;
  }
  run() {
    try {
      while (this.keepGoing) {
        if (!this._hasInternet) {
          this.testInternet();
        }
        setTimeout(() => {
          this.com.interpretAudio().then(response => {

          })
          this.log('Listening process continues.');
        }, 500);
      }
      this.done();
    }
    catch (e) {
      this.log('Dustbin process had fatal error.', e);
      console.log('Dustbin process had fatal error.', e);
      this.done();
      process.exit(1);
    }
  }
  trigger(event, kwargs = {}) {
    kwargs.event = event;
    this.switchboard.emit(event, kwargs);
  }
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