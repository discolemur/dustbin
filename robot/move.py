#! /usr/bin/env python

"""
This is just a bogus class: a placeholder for future robot com classes.
"""

class Move :
    def __init__(self, driver) :
        self.stuff = 'magic'
        self.DRIVER = driver
    def move(self, position) :
        print 'Going to position', position

def main() :
    move = Move(None)
    move.move('Over there.')

if __name__ == '__main__' :
    main()
else :
    Move