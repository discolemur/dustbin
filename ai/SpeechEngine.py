#! /usr/bin/env python

import pyttsx
from time import time
import os

class SpeechEngine :
    def __init__(self, dustbin) :
        self.rate = 150
        #     Geordie (bad)
        self.voice = 'english-north'
        #     US male (ok)
#        self.voice = 'english-us'
#             British female (ok)
        #self.voice = 'english+f2'
        self.volume = 0.5
        self.DUSTBIN = dustbin
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
        os.system('echo \'%s\' | ai/betterEngine.sh' %message)
    def say(self, message) :
        if (self.DUSTBIN) :
            self.DUSTBIN.log(message)
        else :
            print(message)
        if self.DUSTBIN is not None and self.DUSTBIN.hasInternet() :
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

def main() :
    engine = SpeechEngine(None)
    engine.say('This is what the engine sounds like by default.')
    engine.say('Import this class, make an engine object, and use the \'say\' method to say stuff.')

if __name__ == "__main__" :
    main()
else :
    SpeechEngine
