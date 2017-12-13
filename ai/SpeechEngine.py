#! /usr/bin/env python

import pyttsx
from time import time
import os

class SpeechEngine :
    def __init__(self, driver) :
        self.rate = 150
        #     Geordie (bad)
#        self.voice = 'english-north'
        #     US male (ok)
#        self.voice = 'english-us'
        #     British female (ok)
        self.voice = 'english+f2'
        self.volume = 0.5
        self.DRIVER = driver
    def onEnd(self, callback) :
        def finished(name, completed) :
            if callback is not None :
                callback()
        return finished
    def sayUgly(self, message, callback=None) :
        engine = pyttsx.init()
        engine.setProperty('rate',self.rate)
        engine.setProperty('voice', self.voice)
        engine.setProperty('volume', self.volume)
        engine.connect('finished-utterance', self.onEnd(callback))
        engine.say(message)
        engine.runAndWait()
    def sayPretty(self, message, callback=None) :
        # Make sure we escape all single-quote chars
        message = message.replace('\'', '\'\\\'\'')
        print(message)
        os.system('echo \'%s\' | ai/betterEngine.sh' %message)
        if callback is not None :
            callback()
    def say(self, message, callback=None) :
        if self.DRIVER is not None and self.DRIVER.hasInternet() :
            self.sayPretty(message, callback)
        else :
            self.sayUgly(message, callback)
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

def doSomething() :
    print('Called back!')

def main() :
    engine = SpeechEngine(None)
    engine.say('This is what the engine sounds like by default.', doSomething)
    engine.say('Import this class, make an engine object, and use the \'say\' method to say stuff.', doSomething)

if __name__ == "__main__" :
    main()
else :
    SpeechEngine
