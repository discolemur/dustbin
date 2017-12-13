#! /usr/bin/env python

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

def doSomething() :
    print('Called back!')

class Driver :
    def __init__(self) :
        self.com = Communicator(self)
        self.move = Move(self)
        self.logTime = time()
        self._hasInternet = internet()
    def run(self) :
        # Do some dumb stuff for now.
        response = self.com.detect_intent_texts('Who are you?', doSomething)
        self.move.move(response.query_result.action)
    def hasInternet(self) :
        if (time() - self.logTime) > 60 :
            self._hasInternet = internet()
        return self._hasInternet

def main() :
    driver = Driver()
    driver.run()

if __name__ == '__main__' :
    main()
else :
    Driver