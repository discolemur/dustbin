from threading import Lock
from communication.Events import Events
from machine_learning import Objects


class Vision :
    def __init__(self, dustbin) :
        self.known_people = []
        self.known_objects = []
        self.DUSTBIN = dustbin
        self.actMutex = Lock()
        self._subscribeListeners()

    ''' HANDLERS '''
    def _handleFindObject(self, obj) :
        self.DUSTBIN.log('Find object is not yet implemented.')
        self.DUSTBIN.trigger(Events.OBJECT_FOUND, obj)
        self.actMutex.release()
    def _handleIdentifyObject(self, obj) :
        self.DUSTBIN.log('Identify object is not yet implemented.')
        self.DUSTBIN.trigger(Events.OBJECT_IDENTIFIED, obj)
        self.actMutex.release()
    def _handleFindPerson(self, person) :
        self.DUSTBIN.log('Find person is not yet implemented.')
        self.DUSTBIN.trigger(Events.PERSON_FOUND, person)
        self.actMutex.release()
    def _handleIdentifyPerson(self, person) :
        self.DUSTBIN.log('Identify person is not yet implemented.')
        self.DUSTBIN.trigger(Events.PERSON_IDENTIFIED, person)
        self.actMutex.release()

    ''' METHODS '''
    def _subscribeListeners(self) :
        self.DUSTBIN.subscribe(Events.EventListener(Events.REQ_FIND_OBJECT, self._handleFindObject))
        self.DUSTBIN.subscribe(Events.EventListener(Events.REQ_IDENTIFY_OBJECT, self._handleIdentifyObject))
        self.DUSTBIN.subscribe(Events.EventListener(Events.REQ_FIND_PERSON, self._handleFindPerson))
        self.DUSTBIN.subscribe(Events.EventListener(Events.REQ_IDENTIFY_PERSON, self._handleIdentifyPerson))
    def stop(self) :
        self.DUSTBIN.log('ENDING VISION THREAD')
        self.actMutex.release()
    def run(self) :
        while self.DUSTBIN.keepGoing :
            self.actMutex.acquire()
            self.DUSTBIN.log('Still going.')

