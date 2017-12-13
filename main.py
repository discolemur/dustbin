#! /usr/bin/env python

from Dustbin import Dustbin
from glob import glob
from time import time
import os

# Number of log files to keep.
LOG_LIMIT = 5

def removeOneLogfile(files) :
    files = sorted(files)
    print("Removing old log file %s" %files[0])
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

def main(timeout, verbose) :
    fh = open(getLogfile(), 'w')
    dustbin = Dustbin(fh, timeout, verbose)
    dustbin.run()
    fh.close()

if __name__ == '__main__':
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument('--verbose', '-v', action="store_true", default=False, help="Print log to console (still logs in the file).")
    parser.add_argument('--timeout', '-t', type=int, default=15, help="Audio timeout. This is how long it will listen for your response before giving up.")
    args = parser.parse_args()
    main(args.timeout, args.verbose)