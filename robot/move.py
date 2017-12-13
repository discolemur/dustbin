#! /usr/bin/env python

"""
This is just a bogus class: a placeholder for future robot com classes.
"""

class Move :
    def __init__(self, dustbin) :
        self.stuff = 'magic'
        self.DUSTBIN = dustbin
    def move(self, position) :
        self.DUSTBIN.log('Going to position %s' %position)

def main() :
    move = Move(None)
    move.move('Over there.')

if __name__ == '__main__' :
    main()
else :
    Move