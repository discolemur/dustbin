#! /usr/bin/env python

import sys

from Dustbin import Dustbin
from Events import Events
from test.Commands import Commands
from test.timeout import timeout
from test.timeout import TimeoutError

''' TEST EVENT HANDLING '''
#        1) Set the robot to interpret text mode,
#        2) subscribe listeners,
#        3) feed it a series of text commands,
#        4) assert events fire correctly.

TEST_TIMEOUT = 1
AUDIO_TIMEOUT = 4
VERBOSE = False
SILENT = True

def subscribeListeners(dustbin) :
    listeners = {}
    for key in Events.KEYS :
        listener = Events.EventListener(key)
        dustbin.subscribe(listener)
        listeners[key] = listener
    return listeners

class TestCase :

    class Result :
        def __init__(self, success, message) :
            self.success = success
            self.message = message

    def __init__(self, title) :
        self.title = title
        self.commands = []
        self.eventCallCount = {}

    def assertCalled(self, listeners) :
        for event in listeners :
            if event in self.eventCallCount :
                if listeners[event].callCount != self.eventCallCount[event] :
                    raise AssertionError('Event %d called %d times, expected %d' %(event, listeners[event].callCount, self.eventCallCount[event]))
            else :
                if listeners[event].callCount != 0 :
                    raise AssertionError('Event %d called %d times, expected %d' %(event, listeners[event].callCount, self.eventCallCount[event]))

    def addCommand(self, commandFunction) :
        commandFunction(self)

    @staticmethod
    def reportSuccess(message) :
        sys.stdout.write(u'\033[92m \u2713 PASS %s\033[0m\n' %message)

    @staticmethod
    def reportFailure(message) :
        sys.stderr.write(u'\033[91m \u2717 FAIL! %s\033[0m\n' %message)

    #@timeout(TEST_TIMEOUT)
    def _runTest(self) :
        dustbin = Dustbin(None, AUDIO_TIMEOUT, VERBOSE, SILENT)
        listeners = subscribeListeners(dustbin)
        dustbin.runCommands(self.commands)
        success = True
        message = self.title
        try :
            self.assertCalled(listeners)
        except AssertionError as e :
            message = e.message
            success = False
        return TestCase.Result(success, message)
    
    def runTest(self) :
        result = None
        try :
           result = self._runTest()
        except TimeoutError as e :
            message = self.title + e.message
            result = TestCase.Result(False, message)
        if result.success :
            TestCase.reportSuccess(result.message)
        else :
            TestCase.reportFailure(result.message)
        return result.success

def testShutdown() :
    title = 'Test Shutdown'
    testCase = TestCase(title)
    testCase.addCommand(Commands.shutdownCommand)
    return testCase

def testHello() :
    testCase = title = 'Test Hello'
    testCase = TestCase(title)
    testCase.addCommand(Commands.helloCommand)
    return testCase

def testHelloGoodbye() :
    title = 'Test Hello then Shutdown'
    testCase = TestCase(title)
    testCase.addCommand(Commands.helloCommand)
    testCase.addCommand(Commands.shutdownCommand)
    return testCase

def main() :
    tests = [
        testHello(),
        testShutdown(),
        testHelloGoodbye()
    ]
    passing = 0
    failing = 0
    for testCase in tests :
        if testCase.runTest() :
            passing += 1
        else :
            failing += 1
    sys.stdout.write('      Test Results:\033[92m %d passing' %passing)
    if failing :
        sys.stdout.write('\033[91m %d failing' %failing)
    sys.stdout.write('\033[0m\n')
    return 0

if __name__=='__main__' :
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument('--verbose', '-v', action="store_true", default=False, help="Print log to console (still logs in the file).")
    parser.add_argument('--not_silent', '-s', action="store_true", default=False, help="Do not play the audio for the responses.")
    args = parser.parse_args()
    VERBOSE = args.verbose
    SILENT = not args.not_silent
    result = main()
    exit(result)