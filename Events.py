"""
Events Class

Defines global variables representing which events can trigger callbacks.
"""

import uuid

class Events :
    class EventListener :
        def __init__(self, event, callback=None) :
            self._event = event
            self._hash = str(uuid.uuid4())
            self.callCount = 0
            self._callback = callback
        def setCallback(self, callback) :
            self._callback = callback
        def getEvent(self) :
            return self._event
        def getHash(self) :
            return self._hash
        def runCallback(self, params=None) :
            self.callCount += 1
            if self._callback is None :
                return None
            if (params != None) :
                self._callback(params)
            else :
                self._callback()
    def __init__(self) :
        raise Exception('You can\'t create an instance of this class.\nIt is meant to only contain static constants which represent events that you can subscribe listeners to.')

    REQ_SHUTDOWN         = 0
    REQ_IDENTIFY_PERSON  = 1
    REQ_IDENTIFY_OBJECT  = 2
    PERSON_IDENTIFIED    = 3
    OBJECT_IDENTIFIED    = 4
    PERSON_NOT_IDENTIFIED= 5
    OBJECT_NOT_IDENTIFIED= 6
    NOT_UNDERSTAND_MSG   = 7
    REQ_FOLLOW           = 8
    GO_WAIT              = 9
    INTRODUCE_ROBOT      = 10
    GREETINGS            = 11
    YES                  = 12
    NO                   = 13
    REQ_FIND_PERSON      = 14
    REQ_FIND_OBJECT      = 15
    PERSON_FOUND         = 16
    OBJECT_FOUND         = 17
    PERSON_NOT_FOUND     = 18
    OBJECT_NOT_FOUND     = 19
    HEAR_AUDIO           = 20
    UNDERSTAND_MSG       = 21
    RECEIVE_TEXT         = 22

    KEYS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]
    NEXT_KEY             = 23