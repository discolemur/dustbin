from Queue import Queue
from communication.Events import Events

MSG_MEM_SIZE = 10

'''
    This class holds :
        - recent messages
    
    TODO:
        - locations of objects
        - map of area where robot has moved
'''

class MessageListener(Events.EventListener) :
    def callback(self, kwargs) :
        return self.container.addMessage(kwargs['query'], kwargs['response'], kwargs['action'])

class ShortTermMemory :
    def __init__(self, dustbin) :
        self.DUSTBIN = dustbin
        self._recentMessages = Queue(MSG_MEM_SIZE)
        self.messageListener = MessageListener(self)
        self.DUSTBIN.subscribe(Events.UNDERSTAND_MSG, self.messageListener)
        self.DUSTBIN.subscribe(Events.NOT_UNDERSTAND_MSG, self.messageListener)

    def getRecentMessages(self) :
        return list(self._recentMessages.queue)

    def addMessage(self, query, response, action) :
        if (self._recentMessages.full()) :
            self._recentMessages.get()
        self._recentMessages.put((query, response, action))

