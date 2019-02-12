#! /usr/bin/env python

"""
This is just a bogus class: a placeholder for future robot com classes.
"""

from threading import Lock
import CreateHTTP
import time

############  ROOMBA CONSTANTS ###########
ROOMBA_PORT = "/dev/ttyUSB0"
BAUD_RATE = 115200

############  GLOBALS           ##########
DEG_PER_SEC = 40
TIMES_TO_SPIN = 1
REVERSED = False


class Robot :
    def __init__(self, dustbin) :
        self.stuff = 'magic'
        self.DUSTBIN = dustbin
        self.keepGoing = True
        try :
            self.roomba = CreateHTTP.Create(ROOMBA_PORT, BAUD_RATE, CreateHTTP.SAFE_MODE, dustbin)
            self.roomba.resetPose()
            px, py, th = self.roomba.getPose() # Use this method to access location data
        except :
            self.DUSTBIN.log('Could not connect to Roomba.')
            self.roomba = None
        if dustbin is not None :
            from communication.Events import Events
            self.setListeners(Events)
        self.actMutex = Lock()
        self.runMutex = Lock()
    def lock(self) :
        self.actMutex.acquire()
    def unlock(self) :
        self.actMutex.release()
    def move(self, position) :
        #self.lock()
        self.DUSTBIN.log('Going to position %s' %position)
        #self.unlock()
    def wiggle(self) :
        #self.lock()
        if self.roomba is not None :
            self.roomba.go(0, 40)
            time.sleep(.4)
            self.roomba.go(0, -40)
            time.sleep(.8)
            self.roomba.go(0, 40)
            time.sleep(.4)
            self.roomba.go(0, 0)
        #self.unlock()
    # degrees per second, number of times rotating
    def spin(self, dps=DEG_PER_SEC, times=TIMES_TO_SPIN, reversed=REVERSED) :
        if self.roomba is None :
            return
        sign = 1
        if reversed :
            sign = -1
        for i in range(times) :
            self.roomba.go(0, dps * sign)
            time.sleep(times * 360/dps)
    def figureEight(self) :
        # Will do a figure eightor self.toTrigger.qsize() > 0or self.toTrigger.qsize() > 0.
        pass
    def end(self) :
        self.DUSTBIN.log('ENDING ROBOT THREAD')
        if self.roomba is not None :
            self.roomba.close()
        self.keepGoing = False
        self.runMutex.release()
    def setListeners(self, Events) :
        class WiggleListener(Events.EventListener) :
            def callback(self, kwargs) :
                return self.container.wiggle()
        class SpinListener(Events.EventListener) :
            def callback(self, kwargs) :
                return self.container.spin(kwargs['dps'], kwargs['times'], kwargs['reversed'])
        class FigureEightListener(Events.EventListener) :
            def callback(self, kwargs) :
                return self.container.figureEight()
        self.wiggleListener = WiggleListener(self)
        self.figureEightListener = FigureEightListener(self)
        self.spinListener = SpinListener(self)
        ### Placeholders ###
        self.DUSTBIN.subscribe(Events.REQ_FIND_OBJECT, self.wiggleListener)
        self.DUSTBIN.subscribe(Events.REQ_FIND_PERSON, self.wiggleListener)
        self.DUSTBIN.subscribe(Events.REQ_FOLLOW, self.wiggleListener)
        self.DUSTBIN.subscribe(Events.GO_WAIT, self.wiggleListener)
        ### Finished ###
        self.DUSTBIN.subscribe(Events.REQ_WIGGLE, self.wiggleListener)
        self.DUSTBIN.subscribe(Events.REQ_SPIN, self.spinListener)
        self.DUSTBIN.subscribe(Events.REQ_FIGURE_EIGHT, self.figureEightListener)
    def run(self) :
        try :
            while self.keepGoing :
                self.DUSTBIN.log('Robot process continues.')
                self.runMutex.acquire()
        except Exception as e :
            self.DUSTBIN.log('Robot process had fatal error.', e)
            print('Robot process had fatal error.', e)
        self.DUSTBIN.log('ROBOT OFFICIALLY DEAD.')

def main() :
    robot = Robot(None)
    robot.wiggle()
    robot.spin()
    robot.figureEight()
    robot.end()

if __name__ == '__main__' :
    main()
