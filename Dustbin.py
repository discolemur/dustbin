"""
Dustbin Class

Contains the main switchboard for the project, connecting all other components.

Holds global variables and global methods.
"""

from ai.Communicator import Communicator
from robot.Robot import Robot
from time import time
from time import sleep
from Switchboard import Switchboard
from Events import Events
from threading import Thread
from threading import Lock

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

class Dustbin :
    def __init__(self, logfh, audio_timeout, verbose, silent) :
        self.initVars(logfh, verbose, silent)
        # First need a switchboard for subscription
        self.switchboard = Switchboard(self)
        self.switchboardThread = Thread(target = self.switchboard.run)
        self.switchboardThread.start()
        # Then need a communicator
        self.com = Communicator(audio_timeout, self)
        # Finally can add a robot
        self.robot = Robot(self)
        self.robotThread = Thread(target = self.robot.run)
        self.robotThread.start()
        # End by subscribing to shutdown
        ShutdownListener = Events.EventListener(Events.REQ_SHUTDOWN, self.done)
        self.subscribe(ShutdownListener)
    def initVars(self, logfh, verbose, silent) :
        self.keepGoing = True
        self._REFRESH_RATE = 60
        self.VERBOSE = verbose
        self.silent = silent
        self._logfh = logfh
        self.logLock = Lock()
        # Checks for internet connection after this amount of time.
        self._logTime = time()
        self._hasInternet = internet()

    def log(self, message) :
        self.logLock.acquire()
        if self.VERBOSE :
            print(message)
        if self._logfh is not None :
            self._logfh.write(message)
            self._logfh.write('\n')
        self.logLock.release()
    def subscribe(self, listener) :
        self.switchboard.subscribe(listener)
    def trigger(self, event, params=None) :
        self.switchboard.runTrigger(event, params)
    def done(self) :
        self.keepGoing = False
        # NEVER REMOVE THIS LINE! Somehow, it is necessary.
        self.switchboard.stop()
        self.robot.stop()
    def runCommands(self, commands, callback) :
        self.callback = callback
        for command in commands :
            if '.wav' in command:
                self.com.interpretFromWavFile(command)
            else :
                self.com.interpretText(command)
            sleep(0.5)
        # Yes, we need to do this more than once or it won't work.
        self.done()
        if self.callback is not None :
            self.callback()
    def run(self) :
        while self.keepGoing :
            response = self.com.interpretAudio()
            sleep(0.5)
        self.done()
    def hasInternet(self) :
        # After REFRESH_RATE seconds, should check again for internet connection
        if (time() - self._logTime) > self._REFRESH_RATE :
            self._hasInternet = internet()
            self._logTime = time()
        return self._hasInternet
