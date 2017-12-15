"""
Dustbin Class

Contains the main switchboard for the project, connecting all other components.

Holds global variables and global methods.
"""

from ai.Communicator import Communicator
from robot.move import Move
from time import time
from Switchboard import Switchboard
from Events import Events

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
    def __init__(self, logfh, audio_timeout, verbose) :
        self.com = Communicator(audio_timeout, self)
        self.move = Move(self)
        self._logTime = time()
        self._hasInternet = internet()
        self._logfh = logfh
        # Checks for internet connection after this amount of time.
        self._REFRESH_RATE = 60
        self.VERBOSE = verbose
        self.switchboard = Switchboard(self)
        self.keepGoing = True
    def log(self, message) :
        if self.VERBOSE :
            print(message)
        if self._logfh is not None :
            self._logfh.write(message)
            self._logfh.write('\n')
    def subscribe(self, listener) :
        self.switchboard.subscribe(listener)
    def trigger(self, event, params=None) :
        self.switchboard.runTrigger(event, params)
    def done(self) :
        self.keepGoing = False
    def run(self) :
        ShutdownListener = Events.EventListener(Events.REQ_SHUTDOWN)
        ShutdownListener.setCallback(self.done)
        self.subscribe(ShutdownListener)
        while self.keepGoing :
            response = self.com.interpretAudio()
    def hasInternet(self) :
        # After REFRESH_RATE seconds, should check again for internet connection
        if (time() - self._logTime) > self._REFRESH_RATE :
            self._hasInternet = internet()
            self._logTIme = time()
        return self._hasInternet