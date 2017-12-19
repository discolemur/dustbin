#! /usr/bin/env python

from Dustbin import Dustbin
from glob import glob
from time import time
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

def main(timeout, verbose, silent) :
    fh = open(getLogfile(), 'w')
    dustbin = Dustbin(fh, timeout, verbose, silent)
    dustbin.run()
    fh.close()

if __name__ == '__main__':
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument('--verbose', '-v', action="store_true", default=False, help="Print log to console (still logs in the file).")
    parser.add_argument('--silent', '-s', action="store_true", default=False, help="Do not play the audio for the responses.")
    parser.add_argument('--timeout', '-t', type=int, default=5, help="Audio timeout. This is how long it will listen for your response before giving up.")
    args = parser.parse_args()
    main(args.timeout, args.verbose, args.silent)