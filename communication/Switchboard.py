"""
Switchboard Class

The main switchboard for the project, managing callbacks when events occur.
"""

from Events import Events
from Queue import Queue

from threading import Lock

# Protects the switchboard object
mutex = Lock()

class Switchboard :
    def __init__(self, dustbin) :
        self.switchboard = { k : {} for k in Events.KEYS}
        self.DUSTBIN = dustbin
        self.toTrigger = Queue()
        self.keepGoing = True
    def stop(self) :
        self.DUSTBIN.log('ENDING SWITCHBOARD THREAD')
        self.keepGoing = False
        self.toTrigger.put((None,None))
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
    def _triggerEvent(self, event, kwargs) :
        if event is None and kwargs is None :
            return
        mutex.acquire()
        self.DUSTBIN.log("Event %d triggered." %event)
        for listener in self.switchboard[event].values() :
            try :
                listener.runCallback(kwargs)
            except Exception as e :
                # Program should not die.
                self.DUSTBIN.log('EXCEPTION IN CALLBACK FOR EVENT', e, e.message)
                continue
        mutex.release()
    def run(self) :
        try :
            while self.keepGoing :
                self.DUSTBIN.log('Switchboard process continues.')
                event, kwargs = self.toTrigger.get(True)
                self._triggerEvent(event, kwargs)
        except Exception as e :
            self.DUSTBIN.log('Switchboard process had a fatal error.', e)
            print('Switchboard process had a fatal error.', e)
        self.DUSTBIN.log('SWITCHBOARD OFFICIALLY DEAD.')
    def runTrigger(self, event, kwargs) :
        self.toTrigger.put((event, kwargs))
