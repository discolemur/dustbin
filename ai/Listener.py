#! /usr/bin/env python

class Listener :
    def __init__(self, driver) :
        self.DRIVER = driver
    def listen(self, seconds) :
        return ""

def main() :
    listener = Listener(None)

if __name__ == '__main__' :
    main()
else :
    Listener