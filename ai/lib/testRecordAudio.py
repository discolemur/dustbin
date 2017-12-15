#! /usr/bin/env python

from AudioHandler import AudioHandler

filename = 'demo.wav'
timeout = 5 #seconds

if __name__ == '__main__':
    handler = AudioHandler(timeout)
    print("please speak a word into the microphone")
    filename = handler.listen(filename)
    print("done - result written to demo.wav")
    handler.play(filename)
