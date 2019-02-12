'use strict';
/*
  Dustbin Class
    Connects all other components.
    Holds global variables and global methods.
*/

const { Events, EventListener, EventEmitter } = require('./communication/Events.js');
const { Communicator, SpeakListener } = require('./communication/Communicator.js');
const { ShortTermMemory , MessageListener } = require('./memory/ShortTermMemory.js');
const Robot = require('./robot/Robot.js');

const {
  FindObjectListener,
  IdentifyObjectListener,
  FindPersonListener,
  IdentifyPersonListener,
  Vision
} = require('./machine_learning/Vision.js');

// from machine_learning.Vision import Vision
// from threading import Thread

function testInternet(callback) {
  require('dns').resolve('www.google.com', function (err) {
    if (err) {
      callback(false);
    } else {
      callback(true);
    }
  });
}

class ShutdownListener extends EventListener {
  callback() {
    return this.container.done()
  }
}

class Dustbin {
  constructor(_logger, audio_timeout, silent) {
    this.logger = _logger;
    this.keepGoing = true;
    this._REFRESH_RATE = 60;
    this.silent = silent;
    this.switchboard = new EventEmitter;
    try {
      this._logTime = Date.now();
      // Checks for internet connection after this amount of time.
      this._hasInternet = this.hasInternet();
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
  subscribe(event, listener) {
    return this.switchboard.subscribe(event, listener);
  }
  log() {
    this.logger.log(arguments);
  }
  done() {
    this.keepGoing = false;
    if (this.robot)
      this.robot.end();
    if (this.vision)
      this.vision.stop();
    this.logger.end();
  }
  hasInternet() {
    // After REFRESH_RATE seconds, should check again for internet connection
    if ((Date.now() - this._logTime) > this._REFRESH_RATE) {
      let self = this;
      testInternet(i => { self._hasInternet = i });
      this._logTime = Date.now();
    }
    return this._hasInternet;
  }
  run() {
    try {
      while (this.keepGoing) {
        setTimeout(()=>{
          const response = this.com.interpretAudio();
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
  trigger(event, kwargs) {
    kwargs.event = event;
    this.switchboard.emit(event, kwargs);
  }
  runCommands(commands) {
    let promise = Promise.resolve();
    for (const command in commands) {
      if (command.indexOf('.wav') != -1) {
        promise = promise.then(()=>this.com.interpretFromWavFile(command));
      }
      else {
        promise = promise.then(()=>this.com.interpretText(command));
      }
    }
    return promise;
  }
}

module.exports = Dustbin;