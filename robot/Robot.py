#! /usr/bin/env python

"""
This is just a bogus class: a placeholder for future robot com classes.
"""

from threading import Lock

class Robot :
    def __init__(self, dustbin) :
        self.stuff = 'magic'
        self.DUSTBIN = dustbin
        self.actMutex = Lock()
    def move(self, position) :
        self.actMutex.acquire()
        self.DUSTBIN.log('Going to position %s' %position)
        self.actMutex.release()
    def stop(self) :
        self.DUSTBIN.log('ENDING ROBOT THREAD')
        self.actMutex.release()
    def run(self) :
        while self.DUSTBIN.keepGoing :
            self.actMutex.acquire()
            self.DUSTBIN.log('Still going.')

def main() :
    robot = Robot(None)
    robot.move('Over there.')

if __name__ == '__main__' :
    main()
