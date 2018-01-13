#! /usr/bin/env python

from Dustbin import Dustbin
from glob import glob
from time import time
from threading import Lock
import os

# Number of log files to keep.
LOG_LIMIT = 5

def removeOneLogfile(files) :
    files = sorted(files)
    os.remove(files[0])

def getLogfile() :
    directory = './logs/'
    try:
        os.stat(directory)
    except:
        os.mkdir(directory)   
    files = glob('logs/*.log')
    filename = 'logs/%d.log' %int(time())
    if len(files) >= LOG_LIMIT :
        removeOneLogfile(files)
    return filename

class Logger :
    def __init__(self, verbose, fh) :
        self.logLock = Lock()
        self.verbose = verbose
        self._logfh = fh
    def log(self, *msgs) :
        message = ''
        for msg in msgs :
            message = message +  ' ' + str(msg)
        self.logLock.acquire()
        if self.verbose :
            print(message)
        if self._logfh is not None :
            self._logfh.write(message)
            self._logfh.write('\n')
        self.logLock.release()

def main(timeout, verbose, silent) :
    _logfh = open(getLogfile(), 'w')
    logger = Logger(verbose, _logfh)
    dustbin = Dustbin(logger, timeout, silent)
    try :
        dustbin.run()
    except :
        dustbin.log('Error occurred. Program died.')
    _logfh.close()

if __name__ == '__main__':
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument('--verbose', '-v', action="store_true", default=False, help="Print log to console (still logs in the file).")
    parser.add_argument('--silent', '-s', action="store_true", default=False, help="Do not play the audio for the responses.")
    parser.add_argument('--timeout', '-t', type=int, default=5, help="Audio timeout. This is how long it will listen for your response before giving up.")
    args = parser.parse_args()
    main(args.timeout, args.verbose, args.silent)
