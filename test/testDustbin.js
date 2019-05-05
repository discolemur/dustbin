"use strict";


const Commands = require('./Commands.js');
const TestCase = require('./TestCase.js');

const assert = require('chai').assert;

// TEST EVENT HANDLING
//   1) Set the robot to interpret text mode,
//   2) subscribe listeners,
//   3) feed it a series of text commands,
//   4) assert events fire correctly.

// TODO: make sure we wait long enough to get a response from the Dustbin.
// TODO: Don't let the dustbin die if it's still waiting for an MQTT response.

describe("Basic commands", function() {
  this.timeout(30000); // Huge timout for debugging.
  describe("Hello, Goodbye.", function() {
    it("should say hi.", function() {
      const title = 'Test Hello';
      return new TestCase(title)
        .addCommand(Commands.helloCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`);
        });
    });
    it("should say bye.", function() {
      const title = 'Test Shutdown';
      return new TestCase(title)
        .addCommand(Commands.shutdownCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`);
        });
    });
    it("should say hello and goodbye", function() {
      const title = 'Test Hello then Shutdown';
      return new TestCase(title)
        .addCommand(Commands.helloCommand)
        .addCommand(Commands.shutdownCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    });
  });
  describe("Conversation", function() {
    it('Introduction', function() {
      const title = 'Test introduction';
      return new TestCase(title)
        .addCommand(Commands.introductionCommand)
        .runTest()
        .then(function(result){
        });
    });
    it('Unknown command', function() {
      const title = 'Test unknown command';
      return new TestCase(title)
        .addCommand(Commands.unknownCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    });
  });
  describe('Identify (check sight)', function() {
    it('Identify Person', function() {
      const title = 'Test identify person';
      return new TestCase(title)
        .addCommand(Commands.identifyPersonCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
    it('Identify object', function() {
      const title = 'Test identify object';
      return new TestCase(title)
        .addCommand(Commands.identifyObjectCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        })
    })
  })
  describe.skip('Find (check sight, memory, and motion)', function() {
    it('Find Person', function() {
      const title = 'Test find person';
      return new TestCase(title)
        .addCommand(Commands.findPersonCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
    it('Find Object', function() {
      const title = 'Test find object';
      return new TestCase(title)
        .addCommand(Commands.findObjectCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
  })
  describe.skip('Follow and wait (check sight, memory, and motion)', function() {
    it('Follow Me', function() {
      const title = 'Test follow me';
      return new TestCase(title)
        .addCommand(Commands.followMeCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
    it('Wait', function() {
      const title = 'Test wait command';
      const params = { 'preposition': 'by', 'obj': 'the door' };
      return new TestCase(title)
        .addCommand(Commands.waitCommand, params)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
  })
  describe('Interpret Audio', function() {
    it('Check audio command', function() {
      const title = 'Test audio command';
      return new TestCase(title)
        .addCommand(Commands.checkHearingCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
  })
  describe.skip('Tricks (check motion)', function() {
    it('Spin', function() {
      const title = 'Test spin';
      return new TestCase(title)
        .addCommand(Commands.spinCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
    it('Wiggle', function() {
      const title = 'Test wiggle';
      return new TestCase(title)
        .addCommand(Commands.wiggleCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
    it('Figure Eight', function() {
      const title = 'Test figure eight'
      return new TestCase(title)
        .addCommand(Commands.figureEightCommand)
        .runTest()
        .then(function(result){
          assert.isTrue(result.success, result.message);
          console.log(`Finished ${title}`)
        });
    })
  })
});
