"""
Dustbin Class

Contains the main switchboard for the project, connecting all other components.

Holds global variables and global methods.
"""

from communication.Communicator import Communicator
from memory.ShortTermMemory import ShortTermMemory
from robot.Robot import Robot
from time import time
from time import sleep
from communication.Switchboard import Switchboard
from communication.Events import Events
from machine_learning.Vision import Vision
from threading import Thread

import socket
def internet(host="8.8.8.8", port=53, timeout=3):
    """
    Host: 8.8.8.8 (google-public-dns-a.google.com)
    OpenPort: 53/tcp
    Service: domain (DNS/TCP)
    """
    try:
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        return True
    except Exception as ex:
        print ex.message
        return False

class ShutdownListener(Events.EventListener) :
    def callback(self, kwargs) :
        return self.container.done()

class Dustbin :
    def __init__(self, logger, audio_timeout, silent) :
        try :
            self.logger = logger
            self.log = self.logger.log
            self.initVars(silent)
            # First need a switchboard for subscription
            self.switchboard = Switchboard(self)
            self.switchboardThread = Thread(target = self.switchboard.run)
            self.switchboardThread.start()
            # Then need a communicator
            self.com = Communicator(audio_timeout, self)
            # Then short term memory
            self.memory = ShortTermMemory(self)
            # Finally can add a robot
            self.robot = Robot(self)
            self.robotThread = Thread(target = self.robot.run)
            self.robotThread.start()
            self.vision = Vision(self)
            self.visionThread = Thread(target = self.vision.run)
            self.visionThread.start()
            # End by subscribing to shutdown
            self.shutdownListener = ShutdownListener(self)
            self.subscribe(Events.REQ_SHUTDOWN, self.shutdownListener)
        except Exception as e :
            print 'FATAL ERROR OCCURRED DURING SETUP!' , e
            self.done()
            exit(1)
    def getLogLock(self) :
        return self.logger.logLock
    def initVars(self, silent) :
        self.keepGoing = True
        self._REFRESH_RATE = 60
        self.silent = silent
        # Checks for internet connection after this amount of time.
        self._logTime = time()
        self._hasInternet = internet()
    def subscribe(self, event, listener, callback=None) :
        self.switchboard.subscribe(event, listener, callback)
    def trigger(self, event, **kwargs) :
        kwargs['event'] = event
        self.switchboard.runTrigger(event, kwargs)
    def done(self) :
        self.keepGoing = False
        # NEVER REMOVE THIS LINE! Somehow, it is necessary.
        if hasattr(self, 'robot') and self.robot is not None:
            self.robot.end()
        if hasattr(self, 'vision') and self.vision is not None :
            self.vision.stop()
        if hasattr(self, 'switchboard') and self.switchboard is not None :
            self.switchboard.stop()
        if hasattr(self, 'robotThread') and self.robotThread is not None :
            self.robotThread.join()
        if hasattr(self, 'visionThread') and self.visionThread is not None :
            self.visionThread.join()
        if hasattr(self, 'switchboardThread') and self.switchboardThread is not None :
            self.switchboardThread.join()
    def runCommands(self, commands, callback) :
        self.callback = callback
        for command in commands :
            if '.wav' in command:
                self.com.interpretFromWavFile(command)
            else :
                self.com.interpretText(command)
        sleep(2) # Hokey way to wait for processes to finish
        if self.callback is not None :
            self.callback()
    def run(self) :
        try :
            while self.keepGoing :
                response = self.com.interpretAudio()
                sleep(0.5)
                self.log('Listening process continues.')
            self.done()
        except Exception as e:
            self.log('Dustbin process had fatal error.', e)
            print('Dustbin process had fatal error.', e)
            self.done()
            exit(1)
    def hasInternet(self) :
        # After REFRESH_RATE seconds, should check again for internet connection
        if (time() - self._logTime) > self._REFRESH_RATE :
            self._hasInternet = internet()
            self._logTime = time()
        return self._hasInternet
