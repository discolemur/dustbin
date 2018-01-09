#! /usr/bin/env python

"""
This is just a bogus class: a placeholder for future robot com classes.
"""

from threading import Lock
import Create
import time

ROOMBA_PORT = "/dev/ttyUSB0"
BAUD_RATE = 115200

class Robot :
    def __init__(self, dustbin) :
        self.stuff = 'magic'
        self.DUSTBIN = dustbin
        self.keepGoing = True
        try :
            self.roomba = Create.Create(dustbin, ROOMBA_PORT, BAUD_RATE, Create.SAFE_MODE)
            self.roomba.resetPose()
            px, py, th = self.roomba.getPose() # Use this method to access location data
        except :
            self.DUSTBIN.log('Could not connect to Roomba.')
            self.roomba = None
        if dustbin is not None :
            self.setListeners()
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
        print 'WIGGLE!'
        if self.roomba is not None :
            self.roomba.go(0, 40)
            time.sleep(.4)
            self.roomba.go(0, -40)
            time.sleep(.8)
            self.roomba.go(0, 40)
            time.sleep(.4)
            self.roomba.go(0, 0)
        #self.unlock()
    def end(self) :
        if self.DUSTBIN is not None:
            self.DUSTBIN.log('ENDING ROBOT THREAD')
        if self.roomba is not None :
            self.roomba.close()
        self.keepGoing = False
        self.runMutex.release()
    def setListeners(self) :
        from communication.Events import Events
        this = self
        class WiggleListener(Events.EventListener) :
            def callback(self, kwargs) :
                return this.wiggle()
        self.wiggleListener = WiggleListener()
        self.DUSTBIN.subscribe(Events.REQ_FIND_OBJECT, self.wiggleListener)
        self.DUSTBIN.subscribe(Events.REQ_FIND_PERSON, self.wiggleListener)
    def run(self) :
        try :
            while self.keepGoing :
                self.runMutex.acquire()
        except :
            self.DUSTBIN.log('Robot process had fatal error.')

def main() :
    robot = Robot(None)
    robot.wiggle()
    robot.end()

if __name__ == '__main__' :
    main()
