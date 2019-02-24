"use strict";

const Dustbin = require('../Dustbin.js');
const Logger = require('../Logger.js');

const props = require('./props');
const VERBOSE = props.verbose;
const SILENT = props.silent;
const AUDIO_TIMEOUT = props.audioTimeout;
const PERSISTENT_LOGGING = true;

const { Events, EventListener, EventsByNumber } = require('../communication/Events.js');
const assert = require('chai').assert;

const TEST_LOGGER = new Logger(VERBOSE, PERSISTENT_LOGGING);

class TestCase {
    constructor(title) {
        this.title = title;
        this.commands = [];
        this.eventCallCount = {};
        this.success = true;
        this.message = this.title;
        this.dustbin = new Dustbin(TEST_LOGGER, AUDIO_TIMEOUT, SILENT, true);
    }

    assertCalled(listeners) {
        for (let event of Object.keys(listeners)) {
            if (this.eventCallCount[event] !== undefined) {
                assert.equal(listeners[event].callCount,
                    this.eventCallCount[event],
                    `Event ${EventsByNumber[event]} called ${listeners[event].callCount} times, expected ${this.eventCallCount[event]}`);
            }
            else {
                assert.equal(listeners[event].callCount,
                    0,
                    `Event ${EventsByNumber[event]} called ${listeners[event].callCount} times, expected 0`);
            }
        }
    }

    assertHasNonEmptyParam(params=null) {
        if (!params) {
            return;
        }
        for (let key of Object.keys(params)) {
            if (typeof params[key] === "string" && params[key].length > 0) {
                return;
            }
            if (params[key] !== undefined && params[key] !== null) {
                return;
            }
            this.success = false;
            this.message = `${this.message} : param ${key} is empty.`;
        }
    }

    addCommand(commandFunction, params=null) {
        if (params) {
            commandFunction(this, params);
        }
        else {
            commandFunction(this);
        }
        return this;
    }

    _finish() {
        if (this.success) {
            try {
                this.assertCalled(this.listeners);
            }
            catch(e) {
                this.message = this.message + ': ' + e.message;
                this.success = false;
            }
        }
        this.dustbin.done();
        return {success: this.success, message: this.message};
    }

    subscribeListeners() {
        let listeners = {};
        for (let key of Object.values(Events)) {
            let listener = new EventListener(key, (kwargs)=>this.assertHasNonEmptyParam(kwargs));
            this.dustbin.subscribe(listener);
            listeners[key] = listener;
        }
        return listeners;
    }

    runTest() {
        console.log(`${'='.repeat(20)}> Test step: ${this.title}`);
        this.listeners = this.subscribeListeners();
        let self = this;
        return this.dustbin.runCommands(this.commands).catch(err=>{
            console.log(err);
            self.success = false;
        }).then(()=>self._finish());
    }
}

module.exports = TestCase;