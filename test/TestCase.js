"use strict";

const { Events, EventListener } = require('../communication/Events.js');
const AssertionError = require('chai').AssertionError;

class SpecialListener extends EventListener {
    callback(kwargs) {
        return this.container.assertHasNonEmptyParam(kwargs);
    }
}

class TestCase {
    constructor(title) {
        this.title = title;
        this.commands = [];
        this.eventCallCount = {};
        this.success = true;
        this.message = this.title;
    }

    assertCalled(listeners) {
        for (let event of listeners) {
            if (this.eventCallCount[event] !== undefined) {
                if (listeners[event].callCount != this.eventCallCount[event]) {
                    throw new AssertionError('Event %d called %d times, expected %d' %(event, listeners[event].callCount, this.eventCallCount[event]))
                }
            }
            else {
                if (listeners[event].callCount != 0) {
                    throw new AssertionError('Event %d called %d times, expected %d' %(event, listeners[event].callCount, 0))
                }
            }
        }
    }

    assertHasNonEmptyParam(params=null) {
        if (!params) {
            return;
        }
        for (let key of params.keys()) {
            const length = len(str(params[key]));
            if (length > 0) {
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
        if (this.success) {
            TestCase.reportSuccess(this.message);
        }
        else {
            TestCase.reportFailure(this.message);
        }
        this.callback(this.success, this.message);
    }

    subscribeListeners(dustbin) {
        let listeners = {};
        for (let key of Object.values(Events)) {
            let listener = new SpecialListener(this);
            dustbin.subscribe(key, listener);
            listeners[key] = listener;
        }
        return listeners;
    }

    runTest(dustbin, callback) {
        console.log(`${'='*20}> Running test: ${this.title}`);
        this.callback = callback;
        this.listeners = this.subscribeListeners(dustbin);
        return dustbin.runCommands(this.commands, this._finish);
    }
}

module.exports = TestCase;