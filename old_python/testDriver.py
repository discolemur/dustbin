#! /usr/bin/env python

import sys

from Dustbin import Dustbin
from communication.Events import Events

from test.Commands import Commands
from test.TestCase import TestCase

from main import Logger

'''
    TEST EVENT HANDLING
        1) Set the robot to interpret text mode,
        2) subscribe listeners,
        3) feed it a series of text commands,
        4) assert events fire correctly.
'''

VERBOSE = False
SILENT = True

AUDIO_TIMEOUT = 4

passing = 0
failing = 0
failMessages = ''

def testShutdown() :
    title = 'Test Shutdown'
    return TestCase(title) \
        .addCommand(Commands.shutdownCommand)

def testHello() :
    title = 'Test Hello'
    return TestCase(title) \
        .addCommand(Commands.helloCommand)

def testHelloGoodbye() :
    title = 'Test Hello then Shutdown'
    return TestCase(title) \
        .addCommand(Commands.helloCommand) \
        .addCommand(Commands.shutdownCommand)

def testFollowMe() :
    title = 'Test follow me'
    return TestCase(title) \
        .addCommand(Commands.followMeCommand)

def testFindPerson() :
    title = 'Test find person'
    return TestCase(title) \
        .addCommand(Commands.findPersonCommand)

def testFindObject() :
    title = 'Test find object'
    return TestCase(title) \
        .addCommand(Commands.findObjectCommand)

def testIdentifyPerson() :
    title = 'Test identify person'
    return TestCase(title) \
        .addCommand(Commands.identifyPersonCommand)

def testIdentifyObject() :
    title = 'Test identify object'
    return TestCase(title) \
        .addCommand(Commands.identifyObjectCommand)

def testIntroduction() :
    title = 'Test introduction'
    return TestCase(title) \
        .addCommand(Commands.introductionCommand)

def testUnknown() :
    title = 'Test unknown command'
    return TestCase(title) \
        .addCommand(Commands.unknownCommand)

def testCheckHearing() :
    title = 'Test check hearing'
    return TestCase(title) \
        .addCommand(Commands.checkHearingCommand)

def testWait() :
    title = 'Test wait command'
    params = {'preposition':'by', 'obj':'the door'}
    return TestCase(title) \
        .addCommand(Commands.waitCommand, params)

def testSpin() :
    title = 'Test spin'
    return TestCase(title) \
        .addCommand(Commands.spinCommand)
def testWiggle() :
    title = 'Test wiggle'
    return TestCase(title) \
        .addCommand(Commands.wiggleCommand)
def testFigureEight() :
    title = 'Test figure eight'
    return TestCase(title) \
        .addCommand(Commands.figureEightCommand)

def report(dustbin) :
    message = '      Test Results:\033[92m %d passing' %passing
    if failing :
        message = message + '\033[91m %d failing' %failing
        message = message + '\033[0m\n'
        message = message + failMessages
    message = message + '\033[0m\n'
    dustbin.log(message)
    sys.stdout.write(message)

def handleResult(success, message) :
    global passing
    global failing
    global failMessages
    if success :
        passing += 1
    else :
        failing += 1
        failMessages = failMessages + message + '\n'

def main() :
    global passing
    global failing
    tests = [
        testHello(),
        testShutdown(),
        testHelloGoodbye(),
        testFollowMe(),
        testFindPerson(),
        testFindObject(),
        testIdentifyObject(),
        testIdentifyPerson(),
        testIntroduction(),
        testUnknown(),
        testCheckHearing(),
        testWait(),
        testSpin(),
        testFigureEight(),
        testWiggle()
    ]
    fh = open('logs/latestTest.log', 'w')
    logger = Logger(VERBOSE, fh)
    dustbin = Dustbin(logger, AUDIO_TIMEOUT, SILENT)
    for testCase in tests :
        if testCase.shouldRun() :
            if not dustbin.keepGoing :
                dustbin = Dustbin(logger, AUDIO_TIMEOUT, SILENT)
            testCase.runTest(dustbin, handleResult)
    if dustbin.keepGoing :
        dustbin.done()
    report(dustbin)
    # Do not close it. The program will freeze.
    #fh.close()
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
