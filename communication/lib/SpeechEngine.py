import pyttsx
from time import time
import os

def defaultHasInternet() :
    return False

class SpeechEngine :
    def __init__(self, logFunction=None, hasInternetFunction=defaultHasInternet) :
        """ Variables """
        self.rate = 150
        #     Geordie (bad)
        self.voice = 'english-north'
        #     US male (ok)
#        self.voice = 'english-us'
#             British female (ok)
        #self.voice = 'english+f2'
        self.volume = 0.5
        """ Functions """
        self.logFunction = logFunction
        self.hasInternetFunction = hasInternetFunction
    def log(self, message) :
        if self.logFunction is not None :
            self.logFunction(message)
        else :
            print(message)
    def sayUgly(self, message) :
        engine = pyttsx.init()
        engine.setProperty('rate',self.rate)
        engine.setProperty('voice', self.voice)
        engine.setProperty('volume', self.volume)
        engine.say(message)
        engine.runAndWait()
    def sayPretty(self, message) :
        # Make sure we escape all single-quote chars
        message = message.replace('\'', '\'\\\'\'')
        os.system('echo \'%s\' | communication/lib/betterEngine.sh' %message)
    def say(self, message) :
        self.log(message)
        if self.hasInternetFunction() :
            self.sayPretty(message)
        else :
            self.sayUgly(message)
    def setProperty(self, property, value) :
        if property == 'rate' :
            self.rate = value
        if property == 'voice' :
            self.voice = value
        if property == 'volume' :
            self.volume = value
    def getProperty(self, property) :
        if property == 'rate' :
            return self.rate
        if property == 'voice' :
            return self.voice
        if property == 'volume' :
            return self.volume
    def getPropertyNames(self) :
        return ['rate','voice','volume']