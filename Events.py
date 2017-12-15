"""
Events Class

Defines global variables representing which events can trigger callbacks.
"""

class Events :
    def __init__(self) :
        raise Exception('You can\'t create an instance of this class. It is meant to only contain static constants representing events that you can subscribe listeners to.')

    REQ_SHUTDOWN         = 0
    REQ_IDENTIFY_PERSON  = 1
    REQ_IDENTIFY_OBJECT  = 2
    PERSON_IDENTIFIED    = 3
    OBJECT_IDENTIFIED    = 4
    HEAR_VOICE           = 5
    UNDERSTAND_MSG       = 6
    NOT_UNDERSTAND_MSG   = 7
    REQ_FOLLOW           = 8

    KEYS = [0,1,2,3,4,5,6,7,8]
    NEXT_KEY             = 9