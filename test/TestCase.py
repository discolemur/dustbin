from communication.Events import Events
import sys

def subscribeListeners(dustbin, _callback) :
    listeners = {}
    for key in Events.KEYS :
        class SpecialListener(Events.EventListener) :
            def callback(self, kwargs) :
                return _callback()
        listener = SpecialListener()
        dustbin.subscribe(key, listener)
        listeners[key] = listener
    return listeners

class TestCase :

    lock = None

    def __init__(self, title) :
        self.title = title
        self.commands = []
        self.eventCallCount = {}
        self.success = True
        self.message = self.title

    def only(self) :
        if TestCase.lock is None :
            TestCase.lock = []
        TestCase.lock.append(self.title)
        return self

    def assertCalled(self, listeners) :
        for event in listeners :
            if event in self.eventCallCount :
                if listeners[event].callCount != self.eventCallCount[event] :
                    raise AssertionError('Event %d called %d times, expected %d' %(event, listeners[event].callCount, self.eventCallCount[event]))
            else :
                if listeners[event].callCount != 0 :
                    raise AssertionError('Event %d called %d times, expected %d' %(event, listeners[event].callCount, 0))

    def assertHasNonEmptyParam(self, params=None) :
        if params is None :
            return
        for key in params.keys() :
            if len(params[key]) > 0 :
                return
        self.success = False
        self.message = self.message + ': ' + 'param %s is empty.' %key


    def addCommand(self, commandFunction, params=None) :
        if params is not None :
            commandFunction(self, params)
        else :
            commandFunction(self)
        return self

    @staticmethod
    def reportSuccess(message) :
        sys.stdout.write(u'\033[92m \u2713 PASS %s\033[0m\n' %message)

    @staticmethod
    def reportFailure(message) :
        sys.stderr.write(u'\033[91m \u2717 FAIL! %s\033[0m\n' %message)

    def _finish(self) :
        if self.success :
            try :
                self.assertCalled(self.listeners)
            except AssertionError as e :
                self.message = self.message + ': ' + e.message
                self.success = False
        if self.success :
            TestCase.reportSuccess(self.message)
        else :
            TestCase.reportFailure(self.message)
        self.callback(self.success, self.message)

    def runTest(self, dustbin, callback) :
        if TestCase.lock is not None and self.title not in TestCase.lock :
            return
        self.callback = callback
        self.listeners = subscribeListeners(dustbin, self.assertHasNonEmptyParam)
        dustbin.runCommands(self.commands, self._finish)
