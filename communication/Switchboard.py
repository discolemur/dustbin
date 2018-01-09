"""
Switchboard Class

The main switchboard for the project, managing callbacks when events occur.
"""

from Events import Events
from Queue import Queue

from threading import Semaphore
from threading import Lock

# Protects the switchboard object
mutex = Lock()

class Switchboard :
    def __init__(self, dustbin) :
        self.switchboard = { k : {} for k in Events.KEYS}
        self.DUSTBIN = dustbin
        self.toTrigger = Queue()
        self.hasStuff = Semaphore(0)
    def stop(self) :
        self.DUSTBIN.log('ENDING SWITCHBOARD THREAD')
        self.hasStuff.release()
    def unsubscribe(self, event, listener) :
        mutex.acquire()
        if listener.getHash() in self.switchboard[event] :
            del self.switchboard[event][listener.getHash()]
        mutex.release()
    def subscribe(self, event, listener, callback=None) :
        mutex.acquire()
        self.DUSTBIN.log('Setting callback to event %d' %event)
        self.switchboard[event][listener.getHash()] = listener
        if callback is not None :
            callback()
        mutex.release()
    def _handleEvents(self) :
        while not self.toTrigger.empty() :
            self.hasStuff.acquire()
            event, kwargs = self.toTrigger.get(False)
            self.DUSTBIN.log("Event %d triggered." %event)
            mutex.acquire()
            for listener in self.switchboard[event].values() :
                try :
                    listener.runCallback(kwargs)
                except Exception as e :
                    # Program should not die.
                    self.DUSTBIN.log(e.message)
                    continue
            mutex.release()
    def run(self) :
        try :
            while self.DUSTBIN.keepGoing :
                self._handleEvents()
        except :
            self.DUSTBIN.log('Switchboard process had a fatal error.')
    def runTrigger(self, event, kwargs) :
        self.toTrigger.put((event, kwargs))
        self.hasStuff.release()
