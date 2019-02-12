"use strict";

const Dustbin = require('../Dustbin.js');
const Logger = require('../Logger.js');

const props = require('./props');
const Commands = require('./Commands.js');

const VERBOSE = props.verbose;
const SILENT = props.silent;
const AUDIO_TIMEOUT = props.audioTimeout;

let dustbin = new Dustbin(new Logger(VERBOSE), AUDIO_TIMEOUT, SILENT);

const TestCase = require('./TestCase.js');

const assert = require('chai').assert;

// TEST EVENT HANDLING
//   1) Set the robot to interpret text mode,
//   2) subscribe listeners,
//   3) feed it a series of text commands,
//   4) assert events fire correctly.

describe("Basic commands", () => {
  beforeEach(() => {
    if (!dustbin.keepGoing) {
      dustbin = Dustbin(logger, AUDIO_TIMEOUT, SILENT);
    }
  });
  after(() => {
    dustbin.done();
  });
  describe("Hello, Goodbye.", () => {
    it("should say hi.", () => {
      const title = 'Test Hello';
      return new TestCase(title)
        .addCommand(Commands.helloCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    });
    it("should say bye.", () => {
      const title = 'Test Shutdown';
      return new TestCase(title)
        .addCommand(Commands.shutdownCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    });
    it("should say hello and goodbye", () => {
      const title = 'Test Hello then Shutdown';
      return new TestCase(title)
        .addCommand(Commands.helloCommand)
        .addCommand(Commands.shutdownCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    });
  });
  describe("Conversation", () => {
    it('Introduction', () => {
      const title = 'Test introduction';
      return new TestCase(title)
        .addCommand(Commands.introductionCommand)
        .runTest(dustbin)
        .then(result=>{
          
        });
    });
    it('Unknown command', () => {
      const title = 'Test unknown command';
      return new TestCase(title)
        .addCommand(Commands.unknownCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    });
  });
  describe('Identify (check sight)', () => {
    it('Identify Person', () => {
      const title = 'Test identify person';
      return new TestCase(title)
        .addCommand(Commands.identifyPersonCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    })
    it('Identify object', () => {
      const title = 'Test identify object';
      return new TestCase(title)
        .addCommand(Commands.identifyObjectCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    })
  })
  describe('Find (check sight, memory, and motion)', () => {
    it('Find Person', () => {
      const title = 'Test find person';
      return new TestCase(title)
        .addCommand(Commands.findPersonCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    })
    it('Find Object', () => {
      const title = 'Test find object';
      return new TestCase(title)
        .addCommand(Commands.findObjectCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    })
  })
  describe('Follow and wait (check sight, memory, and motion)', () => {
    it('Follow Me', () => {
      const title = 'Test follow me';
      return new TestCase(title)
        .addCommand(Commands.followMeCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    })
    it('Wait', () => {
      const title = 'Test wait command';
      const params = { 'preposition': 'by', 'obj': 'the door' };
      return new TestCase(title)
        .addCommand(Commands.waitCommand, params)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    })
  })
  describe('Interpret Audio', () => {
    it('Check audio command', () => {
      const title = 'Test audio command';
      return new TestCase(title)
        .addCommand(Commands.checkHearingCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    })
  })
  describe('Tricks (check motion)', () => {
    it('Spin', () => {
      const title = 'Test spin';
      return new TestCase(title)
        .addCommand(Commands.spinCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    })
    it('Wiggle', () => {
      const title = 'Test wiggle';
      return new TestCase(title)
        .addCommand(Commands.wiggleCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    })
    it('Figure Eight', () => {
      const title = 'Test figure eight'
      return new TestCase(title)
        .addCommand(Commands.figureEightCommand)
        .runTest(dustbin)
        .then(result=>{
          assert.isTrue(result.success, result.message);
        });
    })
  })
});
