from Events import Events
import sys

AUDIO_TIMEOUT = 4

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

    def __init__(self, title, verbose, silent, DustbinClass) :
        self.title = title
        self.commands = []
        self.eventCallCount = {}
        self.VERBOSE = verbose
        self.SILENT = silent
        self.Dustbin = DustbinClass

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

    def _finish(self) :
        success = True
        message = self.title
        try :
            self.assertCalled(self.listeners)
        except AssertionError as e :
            message = e.message
            success = False
        if success :
            TestCase.reportSuccess(message)
        else :
            TestCase.reportFailure(message)
        self.callback(success)

    def runTest(self, callback) :
        self.callback = callback
        dustbin = self.Dustbin(None, AUDIO_TIMEOUT, self.VERBOSE, self.SILENT)
        self.listeners = subscribeListeners(dustbin)
        dustbin.runCommands(self.commands, self._finish)
