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
    return getTestCase(title) \
        .addCommand(Commands.shutdownCommand)

def testHello() :
    title = 'Test Hello'
    return getTestCase(title) \
        .addCommand(Commands.helloCommand)

def testHelloGoodbye() :
    title = 'Test Hello then Shutdown'
    return getTestCase(title) \
        .addCommand(Commands.helloCommand) \
        .addCommand(Commands.shutdownCommand)

def testFollowMe() :
    title = 'Test follow me'
    return getTestCase(title) \
        .addCommand(Commands.followMeCommand)

def testFindMe() :
    title = 'Test find person'
    return getTestCase(title) \
        .addCommand(Commands.findPersonCommand)

def testFindObject() :
    title = 'Test find object'
    return getTestCase(title) \
        .addCommand(Commands.findObjectCommand)

def testIdentifyPerson() :
    title = 'Test identify person'
    return getTestCase(title) \
        .addCommand(Commands.identifyPersonCommand)

def testIdentifyObject() :
    title = 'Test identify object'
    return getTestCase(title) \
        .addCommand(Commands.identifyObjectCommand)

def testIntroduction() :
    title = 'Test introduction'
    return getTestCase(title) \
        .addCommand(Commands.introductionCommand)

def testUnknown() :
    title = 'Test unknown command'
    return getTestCase(title) \
        .addCommand(Commands.unknownCommand)

def testCheckHearing() :
    title = 'Test check hearing'
    return getTestCase(title) \
        .addCommand(Commands.checkHearingCommand)

def testWait() :
    title = 'Test unknown command'
    params = {'preposition':'by', 'obj':'the door'}
    return getTestCase(title) \
        .addCommand(Commands.waitCommand, params)

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
        testHelloGoodbye(),
        testFollowMe(),
        testFindMe(),
        testFindObject(),
        testIdentifyObject(),
        testIdentifyPerson(),
        testIntroduction(),
        testUnknown(),
        testCheckHearing(),
        testWait()
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
