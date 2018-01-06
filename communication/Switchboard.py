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
    def unsubscribe(self, listener) :
        mutex.acquire()
        if listener.getEvent() in self.switchboard \
          and listener.getHash() in self.switchboard[listener.getEvent()] :
            del self.switchboard[listener.getEvent()][listener.getHash()]
        mutex.release()
    def subscribe(self, listener) :
        mutex.acquire()
        #self.DUSTBIN.log('Setting callback to event %d' %listener.getEvent())
        self.switchboard[listener.getEvent()][listener.getHash()] = listener
        mutex.release()
    def _handleEvents(self) :
        while not self.toTrigger.empty() :
            self.hasStuff.acquire()
            event, params = self.toTrigger.get(False)
            self.DUSTBIN.log("Event %d triggered." %event)
            mutex.acquire()
            for listener in self.switchboard[event].values() :
                try :
                    listener.runCallback(params)
                except Exception as e :
                    # Program should not die.
                    self.DUSTBIN.log(e.message)
                    continue
            mutex.release()
    def run(self) :
        while self.DUSTBIN.keepGoing :
            self._handleEvents()
    def runTrigger(self, event, params=None) :
        self.toTrigger.put((event, params))
        self.hasStuff.release()
