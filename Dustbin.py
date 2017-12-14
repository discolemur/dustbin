#! /usr/bin/env python

"""
Dustbin Class

The main switchboard for the project, connecting all other components.

Holds global variables and global methods.
"""

from ai.Communicator import Communicator
from robot.move import Move
from time import time

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

# TODO : I want to be able to subscribe to events.
# When something happens, send the code to a switch, which will run all subscribed target callbacks

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
    def log(self, message) :
        if self.VERBOSE :
            print(message)
        if self._logfh is not None :
            self._logfh.write(message)
            self._logfh.write('\n')
            
    def run(self) :
        # Do some dumb stuff for now.
        response = self.com.interpretAudio()
        #response = self.com.interpretText('Who are you?')
        if response is not None :
            self.move.move(response.query_result.action)
        else :
            self.move.move('nowhere')
    def hasInternet(self) :
        # After REFRESH_RATE seconds, should check again for internet connection
        if (time() - self._logTime) > self._REFRESH_RATE :
            self._hasInternet = internet()
            self._logTIme = time()
        return self._hasInternet

def main(verbose) :
    dustbin = Dustbin(None, True)
    dustbin.run()

if __name__ == '__main__' :
    main(True)
else :
    Dustbin