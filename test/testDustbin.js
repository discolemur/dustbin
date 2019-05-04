"use strict";


const Commands = require('./Commands.js');
const TestCase = require('./TestCase.js');

const assert = require('chai').assert;

// TEST EVENT HANDLING
//   1) Set the robot to interpret text mode,
//   2) subscribe listeners,
//   3) feed it a series of text commands,
//   4) assert events fire correctly.

console.log("NOTE: DON'T FORGET TO RUN MOSQUITTO AND faceRecognizer.py !!!!!!!!!!!!!!")
// TODO: make sure we wait long enough to get a response from the Dustbin.
// TODO: Don't let the dustbin die if it's still waiting for an MQTT response.

// TODO: Make sure "done" is called after test case is completed.

describe("Basic commands", () => {
  describe("Hello, Goodbye.", () => {
    it("should say hi.", () => {
      const title = 'Test Hello';
      return new TestCase(title)
        .addCommand(Commands.helloCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    });
    it("should say bye.", () => {
      const title = 'Test Shutdown';
      return new TestCase(title)
        .addCommand(Commands.shutdownCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    });
    it("should say hello and goodbye", () => {
      const title = 'Test Hello then Shutdown';
      return new TestCase(title)
        .addCommand(Commands.helloCommand)
        .addCommand(Commands.shutdownCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    });
  });
  describe("Conversation", () => {
    it('Introduction', () => {
      const title = 'Test introduction';
      return new TestCase(title)
        .addCommand(Commands.introductionCommand)
        .runTest()
        .then(result=>{
          
        });
    });
    it('Unknown command', () => {
      const title = 'Test unknown command';
      return new TestCase(title)
        .addCommand(Commands.unknownCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    });
  });
  describe('Identify (check sight)', () => {
    it('Identify Person', () => {
      const title = 'Test identify person';
      return new TestCase(title)
        .addCommand(Commands.identifyPersonCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
    it.only('Identify object', () => {
      const title = 'Test identify object';
      return new TestCase(title)
        .addCommand(Commands.identifyObjectCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
  })
  describe.skip('Find (check sight, memory, and motion)', () => {
    it('Find Person', () => {
      const title = 'Test find person';
      return new TestCase(title)
        .addCommand(Commands.findPersonCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
    it('Find Object', () => {
      const title = 'Test find object';
      return new TestCase(title)
        .addCommand(Commands.findObjectCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
  })
  describe.skip('Follow and wait (check sight, memory, and motion)', () => {
    it('Follow Me', () => {
      const title = 'Test follow me';
      return new TestCase(title)
        .addCommand(Commands.followMeCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
    it('Wait', () => {
      const title = 'Test wait command';
      const params = { 'preposition': 'by', 'obj': 'the door' };
      return new TestCase(title)
        .addCommand(Commands.waitCommand, params)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
  })
  describe('Interpret Audio', () => {
    it('Check audio command', () => {
      const title = 'Test audio command';
      return new TestCase(title)
        .addCommand(Commands.checkHearingCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
  })
  describe.skip('Tricks (check motion)', () => {
    it('Spin', () => {
      const title = 'Test spin';
      return new TestCase(title)
        .addCommand(Commands.spinCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
    it('Wiggle', () => {
      const title = 'Test wiggle';
      return new TestCase(title)
        .addCommand(Commands.wiggleCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
    it('Figure Eight', () => {
      const title = 'Test figure eight'
      return new TestCase(title)
        .addCommand(Commands.figureEightCommand)
        .runTest()
        .then(result=>{
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
  })
});
