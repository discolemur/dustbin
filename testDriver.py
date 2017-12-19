#! /usr/bin/env python

import sys

from Dustbin import Dustbin
from Events import Events

from test.Commands import Commands
from test.TestCase import TestCase

'''
    TEST EVENT HANDLING
        1) Set the robot to interpret text mode,
        2) subscribe listeners,
        3) feed it a series of text commands,
        4) assert events fire correctly.
'''

VERBOSE = False
SILENT = True

passing = 0
failing = 0

def getTestCase(title) :
    return TestCase(title, VERBOSE, SILENT, Dustbin)

def testShutdown() :
    title = 'Test Shutdown'
    testCase = getTestCase(title)
    testCase.addCommand(Commands.shutdownCommand)
    return testCase

def testHello() :
    testCase = title = 'Test Hello'
    testCase = getTestCase(title)
    testCase.addCommand(Commands.helloCommand)
    return testCase

def testHelloGoodbye() :
    title = 'Test Hello then Shutdown'
    testCase = getTestCase(title)
    testCase.addCommand(Commands.helloCommand)
    testCase.addCommand(Commands.shutdownCommand)
    return testCase

def report() :
    sys.stdout.write('      Test Results:\033[92m %d passing' %passing)
    if failing :
        sys.stdout.write('\033[91m %d failing' %failing)
    sys.stdout.write('\033[0m\n')

def handleResult(success) :
    global passing
    global failing
    if success :
        passing += 1
    else :
        failing += 1


def main() :
    global passing
    global failing
    tests = [
        testHello(),
        testShutdown(),
        testHelloGoodbye()
    ]
    for testCase in tests :
        testCase.runTest(handleResult)
    report()
    if failing :
        return 1
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
    sys.exit(result)
