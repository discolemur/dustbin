"""
If pyaudio install fails, try this:
sudo apt-get install libportaudio2 libportaudiocpp0 portaudio19-dev
sudo pip install pyaudio
"""

# NOTE: Audio should be 64-bit encoded, so dialogflow says.

"""
    Most of this code is taken from a stackoverflow response by cryo
    See https://stackoverflow.com/questions/892199/detect-record-audio-in-python
"""

from sys import byteorder
from array import array
from struct import pack

import pyaudio
import wave

from time import time

class Listener :
    def __init__(self, audio_timeout, dustbin) :
        self.DUSTBIN = dustbin
        #self.RATE = 44100
        self.RATE = 16000
        self.FORMAT = pyaudio.paInt16
        self.CHUNK_SIZE = 1024
        self.THRESHOLD = 500
        self.AUDIO_TIMEOUT = audio_timeout 
        self.AUDIO_PATH = 'ai/last_recorded_message.wav'
        self.START_TONE = 'ai/start.wav'
        self.STOP_TONE = 'ai/stop.wav'
    def _is_silent(self, snd_data):
        "Returns 'True' if below the 'silent' threshold"
        return max(snd_data) < self.THRESHOLD
    def _normalize(self, snd_data):
        "Average the volume out"
        MAXIMUM = 16384
        times = float(MAXIMUM)/max(abs(i) for i in snd_data)
        r = array('h')
        for i in snd_data:
            r.append(int(i*times))
        return r
    def _trim(self, snd_data):
        "Trim the blank spots at the start and end"
        def __minitrim(snd_data):
            snd_started = False
            r = array('h')
            for i in snd_data:
                if not snd_started and abs(i)>self.THRESHOLD:
                    snd_started = True
                    r.append(i)
                elif snd_started:
                    r.append(i)
            return r
        # Trim to the left
        snd_data = __minitrim(snd_data)
        # Trim to the right
        snd_data.reverse()
        snd_data = __minitrim(snd_data)
        snd_data.reverse()
        return snd_data
    def _add_silence(self, snd_data, seconds):
        "Add silence to the start and end of 'snd_data' of length 'seconds' (float)"
        # For python3, replace xrange with range
        r = array('h', [0 for i in xrange(int(seconds*self.RATE))])
        r.extend(snd_data)
        r.extend([0 for i in xrange(int(seconds*self.RATE))])
        return r
    def _record(self):
        """
        Record a word or words from the microphone and 
        return the data as an array of signed shorts.
        Normalizes the audio, trims silence from the 
        start and end, and pads with 0.5 seconds of 
        blank sound to make sure VLC et al can play 
        it without getting chopped off.
        """
        p = pyaudio.PyAudio()
        stream = p.open(format=self.FORMAT, channels=1, rate=self.RATE,
            input=True, output=True,
            frames_per_buffer=self.CHUNK_SIZE)
        num_silent = 0
        snd_started = False
        r = array('h')
        start = time()
        while 1:
            # little endian, signed short
            snd_data = array('h', stream.read(self.CHUNK_SIZE))
            if byteorder == 'big':
                snd_data.byteswap()
            r.extend(snd_data)
            silent = self._is_silent(snd_data)
            if silent and snd_started:
                num_silent += 1
            elif not silent and not snd_started:
                snd_started = True
            if snd_started and num_silent > 30 or time() - start > self.AUDIO_TIMEOUT:
                break
        sample_width = p.get_sample_size(self.FORMAT)
        stream.stop_stream()
        stream.close()
        p.terminate()
        r = self._normalize(r)
        r = self._trim(r)
        r = self._add_silence(r, 0.5)
        return sample_width, r
    def _record_to_file(self) :
        "Records from the microphone and outputs the resulting data to 'path'"
        sample_width, data = self._record()
        data = pack('<' + ('h'*len(data)), *data)
        wf = wave.open(self.AUDIO_PATH, 'wb')
        wf.setnchannels(1)
        wf.setsampwidth(sample_width)
        wf.setframerate(self.RATE)
        wf.writeframes(data)
        wf.close()
    def listen(self) :
        self.playTone(self.START_TONE)
        self._record_to_file()
        self.playTone(self.STOP_TONE)
        return self.AUDIO_PATH
    def playTone(self, filename) :
        # Taken from
        # length of data to read.
        chunk = 1024
        # open the file for reading.
        wf = wave.open(filename, 'rb')
        # create an audio object
        p = pyaudio.PyAudio()
        # open stream based on the wave object which has been input.
        stream = p.open(format =
                        p.get_format_from_width(wf.getsampwidth()),
                        channels = wf.getnchannels(),
                        rate = wf.getframerate(),
                        output = True)
        # read data (based on the chunk size)
        data = wf.readframes(chunk)
        # play stream (looping from beginning of file to the end)
        while data != '':
            # writing to the stream is what *actually* plays the sound.
            stream.write(data)
            data = wf.readframes(chunk)
        # cleanup stuff.
        stream.close()    
        p.terminate()