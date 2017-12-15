"""
Switchboard Class

The main switchboard for the project, managing callbacks when events occur.
"""

from Events import Events

class Switchboard :
    def __init__(self, dustbin) :
        self.switchboard = { k : {} for k in Events.KEYS}
        self.DUSTBIN = dustbin
    def unsubscribe(self, listener) :
        if listener.getEvent() in self.switchboard \
           and listener.getHash() in self.switchboard[listener.getEvent()] :
            del self.switchboard[listener.getEvent()][listener.getHash()]
    def subscribe(self, listener) :
        self.DUSTBIN.log('Setting callback to event %d' %listener.getEvent())
        self.switchboard[listener.getEvent()][listener.getHash()] = listener
    def runTrigger(self, event, params=None) :
        self.DUSTBIN.log("Event %d triggered." %event)
        for listener in self.switchboard[event].values() :
            try :
                listener.runCallback(params)
            except Exception as e :
                # Program should not die.
                self.DUSTBIN.log(e)
                continue