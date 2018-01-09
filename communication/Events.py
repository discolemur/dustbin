"""
Events Class

Defines global variables representing which events can trigger callbacks.
"""

import uuid
from abc import ABCMeta, abstractmethod

class Events :
    class EventListener :
        __metaclass__ = ABCMeta
        def __init__(self) :
            self._hash = str(uuid.uuid4())
            self.callCount = 0
        def getHash(self) :
            return self._hash
        @abstractmethod
        def callback(self, kwargs) :
            pass
        def runCallback(self, kwargs) :
            self.callCount += 1
            self.callback(kwargs)
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
    HEARD_YES            = 12
    HEARD_NO             = 13
    REQ_FIND_PERSON      = 14
    REQ_FIND_OBJECT      = 15
    PERSON_FOUND         = 16
    OBJECT_FOUND         = 17
    PERSON_NOT_FOUND     = 18
    OBJECT_NOT_FOUND     = 19
    HEAR_AUDIO           = 20
    UNDERSTAND_MSG       = 21
    RECEIVE_TEXT         = 22
    SPEAK                = 23
    RESPONSE_NO          = 24
    RESPONSE_YES         = 25


    _NEXT_KEY             = 26
    KEYS = range(0, _NEXT_KEY)