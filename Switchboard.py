"""
Switchboard Class

The main switchboard for the project, managing callbacks when events occur.
"""

from Events import Events

class Switchboard :
    def __init__(self, dustbin) :
        self.switchboard = { k : [] for k in Events.KEYS}
        self.DUSTBIN = dustbin
    def subscribeCustomTarget(self) :
        rv = Events.NEXT_KEY
        self.switchboard[rv] = []
        Events.KEYS.append(rv)
        Events.NEXT_KEY += 1
        return rv
    def setCallback(self, event, callback) :
        self.DUSTBIN.log('Setting callback to event %d' %event)
        self.switchboard[event].append(callback)
    def runTrigger(self, event, params=None) :
        self.DUSTBIN.log("Event %d triggered." %event)
        for callback in self.switchboard[event] :
            try :
                if params is not None :
                    callback(params)
                else :
                    callback()
            except Exception as e :
                # Program should not die.
                self.DUSTBIN.log(e)
                continue