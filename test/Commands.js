"use strict";
// Define commands and expected outcomes 
// NOTE: try to keep them in the same order as dialogflow keeps them.
// It's easier to keep track that way.

const { Events, EventListener } = require('../communication/Events.js');

function incrementEventCount(testCase, event) {
    if (testCase.eventCallCount[event] === undefined) {
        testCase.eventCallCount[event] = 0;
    }
    testCase.eventCallCount[event]++;
    return testCase;
}

let a = [];
const Commands = {
    checkHearingCommand : (testCase) => {
        testCase.commands.push('test/canYouHearMe.wav');
        testCase = incrementEventCount(testCase, Events.RESPONSE_YES);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_AUDIO);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        return testCase;
    },
    unknownCommand : (testCase) => {
        testCase.commands.push("Elephants trample bushes.");
        testCase = incrementEventCount(testCase, Events.NOT_UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        return testCase;
    },
    helloCommand : (testCase) => {
        testCase.commands.push("Hello.");
        testCase = incrementEventCount(testCase, Events.GREETINGS);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        return testCase;
    },
    findObjectCommand : (testCase) => {
        testCase.commands.push('Find the doorway.');
        testCase = incrementEventCount(testCase, Events.REQ_FIND_OBJECT);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        testCase = incrementEventCount(testCase, Events.OBJECT_FOUND);
        return testCase;
    },
    findPersonCommand : (testCase) => {
        testCase.commands.push('Find me.');
        testCase = incrementEventCount(testCase, Events.REQ_FIND_PERSON);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        testCase = incrementEventCount(testCase, Events.PERSON_FOUND);
        return testCase;
    },
    followMeCommand : (testCase) => {
        testCase.commands.push('Follow me.');
        testCase = incrementEventCount(testCase, Events.REQ_FOLLOW);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        testCase = incrementEventCount(testCase, Events.ROBOT_FOLLOWING);
        return testCase;
    },
    identifyPersonCommand : (testCase) => {
        testCase.commands.push('Who is this?');
        testCase = incrementEventCount(testCase, Events.REQ_IDENTIFY_PERSON);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        testCase = incrementEventCount(testCase, Events.PERSON_IDENTIFIED);
        return testCase;
    },
    identifyObjectCommand : (testCase) => {
        testCase.commands.push('What is this?');
        testCase = incrementEventCount(testCase, Events.REQ_IDENTIFY_OBJECT);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        testCase = incrementEventCount(testCase, Events.OBJECT_IDENTIFIED);
        return testCase;
    },
    introductionCommand : (testCase) => {
        testCase.commands.push("Who are you?");
        testCase = incrementEventCount(testCase, Events.INTRODUCE_ROBOT);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        return testCase;
    },
    shutdownCommand : (testCase) => {
        testCase.commands.push("Shutdown.");
        testCase = incrementEventCount(testCase, Events.REQ_SHUTDOWN);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        return testCase;
    },
    waitCommand : (testCase, params) => {
        const preposition = params['preposition'];
        const obj = params['obj'];
        testCase.commands.push(`Wait ${preposition} ${obj}.`);
        testCase = incrementEventCount(testCase, Events.GO_WAIT);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        testCase = incrementEventCount(testCase, Events.ROBOT_WAITING);
        return testCase;
    },
    wiggleCommand : (testCase) => {
        testCase.commands.push("wiggle");
        testCase = incrementEventCount(testCase, Events.REQ_WIGGLE);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        testCase = incrementEventCount(testCase, Events.ROBOT_MOVED);
        return testCase;
    },
    figureEightCommand : (testCase) => {
        testCase.commands.push("Do a figure eight.");
        testCase = incrementEventCount(testCase, Events.REQ_FIGURE_EIGHT);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        testCase = incrementEventCount(testCase, Events.ROBOT_MOVED);
        return testCase;
    },
    spinCommand : (testCase) => {
        testCase.commands.push("Spin around");
        testCase = incrementEventCount(testCase, Events.REQ_SPIN);
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG);
        testCase = incrementEventCount(testCase, Events.INTERPRETED_TEXT);
        testCase = incrementEventCount(testCase, Events.SPEAK);
        testCase = incrementEventCount(testCase, Events.ROBOT_MOVED);
        return testCase;
    }
}

module.exports = Commands;