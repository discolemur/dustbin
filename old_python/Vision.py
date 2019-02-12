from threading import Lock
from communication.Events import Events
from machine_learning import Objects

class FindObjectListener(Events.EventListener) :
    def callback(self, kwargs) :
        return self.container._handleFindObject(kwargs['obj'])
class IdentifyObjectListener(Events.EventListener) :
    def callback(self, kwargs) :
        return self.container._handleIdentifyObject(kwargs['obj'])
class FindPersonListener(Events.EventListener) :
    def callback(self, kwargs) :
        return self.container._handleFindPerson(kwargs['person'])
class IdentifyPersonListener(Events.EventListener) :
    def callback(self, kwargs) :
        return self.container._handleIdentifyPerson(kwargs['pronoun'])

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
        self.DUSTBIN.trigger(Events.OBJECT_FOUND, obj=obj)
        self.actMutex.release()
    def _handleIdentifyObject(self, obj) :
        self.DUSTBIN.log('Identify object is not yet implemented.')
        self.DUSTBIN.trigger(Events.OBJECT_IDENTIFIED, obj=obj)
        self.actMutex.release()
    def _handleFindPerson(self, person) :
        self.DUSTBIN.log('Find person is not yet implemented.')
        self.DUSTBIN.trigger(Events.PERSON_FOUND, person=person)
        self.actMutex.release()
    def _handleIdentifyPerson(self, pronoun) :
        self.DUSTBIN.log('Identify person is not yet implemented.')
        self.DUSTBIN.trigger(Events.PERSON_IDENTIFIED, person=pronoun)
        self.actMutex.release()

    ''' METHODS '''
    def _subscribeListeners(self) :
        self.FOL = FindObjectListener(self)
        self.IOL = IdentifyObjectListener(self)
        self.FPL = FindPersonListener(self)
        self.IPL = IdentifyPersonListener(self)
        self.DUSTBIN.subscribe(Events.REQ_FIND_OBJECT, self.FOL)
        self.DUSTBIN.subscribe(Events.REQ_IDENTIFY_OBJECT, self.IOL)
        self.DUSTBIN.subscribe(Events.REQ_FIND_PERSON, self.FPL)
        self.DUSTBIN.subscribe(Events.REQ_IDENTIFY_PERSON, self.IPL)
    def stop(self) :
        self.DUSTBIN.log('ENDING VISION THREAD')
        self.actMutex.release()
    def run(self) :
        try :
            while self.DUSTBIN.keepGoing :
                self.DUSTBIN.log('Vision process continues.')
                self.actMutex.acquire()
        except Exception as e :
            self.DUSTBIN.log('Vision process had fatal error.', e)
            print('Vision process had fatal error.', e)
        self.DUSTBIN.log('VISION OFFICIALLY DEAD.')

