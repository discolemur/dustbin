#! /usr/bin/env python

import dialogflow

from SpeechEngine import SpeechEngine
from Listener import Listener

_SESSION_ID = 'dev_sesh'
_PROJECT_ID = 'dust-bin-97d2d'
_LANGUAGE_CODE = 'en-US'

"""
If mplayer is throwing stupid errors, do this:
Add the following to your $HOME/.mplayer/config file:
  lirc=no
"""

class Communicator :
    def __init__(self, driver) :
        self.speaker = SpeechEngine(driver)
        self.listener = Listener(driver)
        self.DRIVER = driver
    
    def detect_intent_texts(self, text, callback=None):
        """Returns the result of detect intent with texts as inputs.

        Using the same `session_id` between requests allows continuation
        of the conversaion."""
        session_client = dialogflow.SessionsClient()

        session = session_client.session_path(_PROJECT_ID, _SESSION_ID)
        print('Session path: {}\n'.format(session))

        text_input = dialogflow.types.TextInput(
            text=text, language_code=_LANGUAGE_CODE)

        query_input = dialogflow.types.QueryInput(text=text_input)

        response = session_client.detect_intent(
            session=session, query_input=query_input)

        print('=' * 20)
        print('Query text: {}'.format(response.query_result.query_text))
        print('Detected intent: {} (confidence: {})\n'.format(
            response.query_result.intent.display_name,
            response.query_result.intent_detection_confidence))
        print('Fulfillment text: {}\n'.format(
            response.query_result.fulfillment_text))
        self.speaker.say(response.query_result.fulfillment_text, callback)
        return response

    def detect_intent_audio(self, audio_file_path, callback=None):
        """Returns the result of detect intent with an audio file as input.
        Using the same `session_id` between requests allows continuation
        of the conversation."""
        session_client = dialogflow.SessionsClient()

        # Note: hard coding audio_encoding and sample_rate_hertz for simplicity.
        audio_encoding = dialogflow.enums.AudioEncoding.AUDIO_ENCODING_LINEAR_16
        sample_rate_hertz = 16000

        session = session_client.session_path(_PROJECT_ID, _SESSION_ID)
        print('Session path: {}\n'.format(session))

        with open(audio_file_path, 'rb') as audio_file:
            input_audio = audio_file.read()

        audio_config = dialogflow.types.InputAudioConfig(
            audio_encoding=audio_encoding, language_code=_LANGUAGE_CODE,
            sample_rate_hertz=sample_rate_hertz)
        query_input = dialogflow.types.QueryInput(audio_config=audio_config)

        response = session_client.detect_intent(
            session=session, query_input=query_input,
            input_audio=input_audio)

        print('=' * 20)
        print('Query text: {}'.format(response.query_result.query_text))
        print('Detected intent: {} (confidence: {})\n'.format(
            response.query_result.intent.display_name,
            response.query_result.intent_detection_confidence))
        print('Fulfillment text: {}\n'.format(
        response.query_result.fulfillment_text))
        self.speaker.say(response.query_result.fulfillment_text, callback)
        return response

    def listen(self, seconds, callback=None) :
        filename = self.listener.record(seconds)
        self.detect_intent_audio(filename, callback)


def doSomething() :
    print('Called back!')

def main():
    com = Communicator(None)
    #com.sendText('Who are you?')
    #event = apiai.events.Event("my_custom_event")
    #com.sendEvent(event)
    #com.detect_intent_texts('hi', doSomething)
    com.detect_intent_audio('spoken.wav', doSomething)
    com.listen(10, doSomething)

if __name__ == '__main__':
    main()
else:
    Communicator

