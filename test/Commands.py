''' Define commands and expected outcomes '''

from Events import Events

def incrementEventCount(testCase, event) :
    if event not in testCase.eventCallCount :
        testCase.eventCallCount[event] = 0
    testCase.eventCallCount[event] += 1
    return testCase

class Commands :
    @staticmethod
    def shutdownCommand(testCase) :
        testCase.commands.append("Shutdown.")
        testCase = incrementEventCount(testCase, Events.REQ_SHUTDOWN)
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG)
        testCase = incrementEventCount(testCase, Events.RECEIVE_TEXT)
        testCase = incrementEventCount(testCase, Events.SPEAK)
        return testCase

    @staticmethod
    def helloCommand(testCase) :
        testCase.commands.append("Hello.")
        testCase = incrementEventCount(testCase, Events.GREETINGS)
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG)
        testCase = incrementEventCount(testCase, Events.RECEIVE_TEXT)
        testCase = incrementEventCount(testCase, Events.SPEAK)
        return testCase

    @staticmethod
    def followMeCommand(testCase) :
        testCase.commands.append('Follow me.')
        testCase = incrementEventCount(testCase, Events.REQ_FOLLOW)
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG)
        testCase = incrementEventCount(testCase, Events.RECEIVE_TEXT)
        testCase = incrementEventCount(testCase, Events.SPEAK)
        return testCase

    @staticmethod
    def identifyPersonCommand(testCase) :
        testCase.commands.append('Who is this?')
        testCase = incrementEventCount(testCase, Events.REQ_IDENTIFY_PERSON)
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG)
        testCase = incrementEventCount(testCase, Events.RECEIVE_TEXT)
        testCase = incrementEventCount(testCase, Events.SPEAK)
        return testCase

    @staticmethod
    def findPersonCommand(testCase) :
        testCase.commands.append('Find me.')
        testCase = incrementEventCount(testCase, Events.REQ_FIND_PERSON)
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG)
        testCase = incrementEventCount(testCase, Events.RECEIVE_TEXT)
        testCase = incrementEventCount(testCase, Events.SPEAK)
        return testCase

    @staticmethod
    def identifyObjectCommand(testCase) :
        testCase.commands.append('What is this?')
        testCase = incrementEventCount(testCase, Events.REQ_IDENTIFY_OBJECT)
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG)
        testCase = incrementEventCount(testCase, Events.RECEIVE_TEXT)
        testCase = incrementEventCount(testCase, Events.SPEAK)
        return testCase

    @staticmethod
    def findObjectCommand(testCase) :
        testCase.commands.append('Find the doorway.')
        testCase = incrementEventCount(testCase, Events.REQ_FIND_OBJECT)
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG)
        testCase = incrementEventCount(testCase, Events.RECEIVE_TEXT)
        testCase = incrementEventCount(testCase, Events.SPEAK)
        return testCase


