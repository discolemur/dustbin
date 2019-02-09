"use strict";

const { Events, EventListener, EventsByNumber } = require('../communication/Events.js');
const assert = require('chai').assert;

class SpecialListener extends EventListener {
    callback(kwargs) {
        console.log("Args to listener:");
        console.log(kwargs);
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
        for (let event of Object.keys(listeners)) {
            if (this.eventCallCount[event] !== undefined) {
                assert.equal(listeners[event].callCount,
                    this.eventCallCount[event],
                    `Event ${EventsByNumber[event]} called ${listeners[event].callCount} times, expected ${this.eventCallCount[event]}`);
            }
            else {
                assert.equal(listeners[event].callCount,
                    0,
                    `Event ${event} called ${listeners[event].callCount} times, expected 0`);
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
        return {success: this.success, message: this.message};
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

    runTest(dustbin) {
        console.log(`${'='.repeat(20)}> Test step: ${this.title}`);
        this.listeners = this.subscribeListeners(dustbin);
        let self = this;
        return dustbin.runCommands(this.commands).then(()=>{return self._finish()});
    }
}

module.exports = TestCase;