''' Define commands and expected outcomes '''

from Events import Events

'''

For simplicity, ECC is eventCallCount (number of expected calls to that listener)

'''

def incrementEventCount(testCase, event) :
    if event not in testCase.eventCallCount :
        testCase.eventCallCount[event] = 0
    testCase.eventCallCount[event] += 1
    return testCase

class Commands :
    @staticmethod
    def shutdownCommand(testCase) :
        testCase.commands.append("Turn yourself off.")
        testCase = incrementEventCount(testCase, Events.REQ_SHUTDOWN)
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG)
        testCase = incrementEventCount(testCase, Events.RECEIVE_TEXT)
        return testCase

    @staticmethod
    def helloCommand(testCase) :
        testCase.commands.append("Hello.")
        testCase = incrementEventCount(testCase, Events.GREETINGS)
        testCase = incrementEventCount(testCase, Events.UNDERSTAND_MSG)
        testCase = incrementEventCount(testCase, Events.RECEIVE_TEXT)
        return testCase