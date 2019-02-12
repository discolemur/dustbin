import dialogflow

from lib.SpeechEngine import SpeechEngine
from lib.AudioHandler import AudioHandler
from Events import Events

from time import time
from time import sleep
_SESSION_ID = 'dev_sesh_%d' %time()
_PROJECT_ID = 'dust-bin-97d2d'
_LANGUAGE_CODE = 'en-US'

"""
If mplayer is throwing stupid errors, do this:
Add the following to your $HOME/.mplayer/config file:
  lirc=no
"""

"""
If shows error
ALSA lib . . . Unknown PCM cards.pcm.{cardname}

Then for each error {cardname} change the following line in /usr/share/alsa/alsa.conf
ORIGINAL:    pcm.{cardname} cards.pcm.{cardname}
NEW:         pcm.{cardname} cards.pcm.default
"""

class SpeakListener(Events.EventListener) :
    def callback(self, kwargs) :
        if ('response' not in kwargs) :
            return None
        return self.container.speak(kwargs)

class Communicator :
    def __init__(self, audio_timeout, dustbin) :
        self.speaker = SpeechEngine(dustbin.log, dustbin.hasInternet)
        self.audioHandler = AudioHandler(audio_timeout)
        self.DUSTBIN = dustbin
        self.speakListener = SpeakListener(self)
        self.DUSTBIN.subscribe(Events.SPEAK, self.speakListener)
    
    def _detect_intent_text(self, text):
        """Returns the result of detect intent with texts as inputs.
        Using the same `session_id` between requests allows continuation
        of the conversation."""
        session_client = dialogflow.SessionsClient()
        session = session_client.session_path(_PROJECT_ID, _SESSION_ID)
        self.DUSTBIN.log('Session path: {}\n'.format(session))
        text_input = dialogflow.types.TextInput(
            text=text, language_code=_LANGUAGE_CODE)
        query_input = dialogflow.types.QueryInput(text=text_input)
        response = session_client.detect_intent(
            session=session, query_input=query_input)
        self.DUSTBIN.log('=' * 20)
        self.DUSTBIN.log('Query text: {}'.format(response.query_result.query_text))
        self.DUSTBIN.log('Detected intent: {} (confidence: {})\n'.format(
            response.query_result.intent.display_name,
            response.query_result.intent_detection_confidence))
        self.DUSTBIN.log('Fulfillment text: {}\n'.format(response.query_result.fulfillment_text))
        self.DUSTBIN.trigger(Events.RECEIVE_TEXT)
        return response

    def _detect_intent_audio(self, audio_file_path):
        """Returns the result of detect intent with an audio file as input.
        Using the same `session_id` between requests allows continuation
        of the conversation."""
        session_client = dialogflow.SessionsClient()
        # Note: hard coding audio_encoding and sample_rate_hertz for simplicity.
        audio_encoding = dialogflow.enums.AudioEncoding.AUDIO_ENCODING_LINEAR_16
        #sample_rate_hertz = 16000
        sample_rate_hertz = self.audioHandler.RATE
        session = session_client.session_path(_PROJECT_ID, _SESSION_ID)
        self.DUSTBIN.log('Session path: {}\n'.format(session))
        with open(audio_file_path, 'rb') as audio_file:
            input_audio = audio_file.read()
        audio_config = dialogflow.types.InputAudioConfig(
            audio_encoding=audio_encoding, language_code=_LANGUAGE_CODE,
            sample_rate_hertz=sample_rate_hertz)
        query_input = dialogflow.types.QueryInput(audio_config=audio_config)
        response = session_client.detect_intent(
            session=session, query_input=query_input,
            input_audio=input_audio)
        self.DUSTBIN.log('=' * 20)
        self.DUSTBIN.log('Query text: {}'.format(response.query_result.query_text))
        self.DUSTBIN.log('Detected intent: {} (confidence: {})\n'.format(
            response.query_result.intent.display_name,
            response.query_result.intent_detection_confidence))
        self.DUSTBIN.log('Fulfillment text: {}\n'.format(response.query_result.fulfillment_text))
        self.DUSTBIN.trigger(Events.HEAR_AUDIO)
        return response

    # REQUIRED ARGS: 'response'=string
    def speak(self, kwargs) :
        if self.DUSTBIN.silent :
            self.DUSTBIN.getLogLock().acquire()
            # Keep this print.
            print kwargs['response']
            self.DUSTBIN.getLogLock().release()
        else :
            self.speaker.say(kwargs['response'])

    def _handleAction(self, response) :
        result = response.query_result
        action = result.action
        response_msg = result.fulfillment_text
        query_msg = result.query_text

        # BASIC COMMUNICATION STATES
        if len(response_msg) > 0 :
            self.DUSTBIN.trigger(Events.SPEAK, query=query_msg, response=response_msg, action=action)
        if action == 'input.unknown' :
            self.DUSTBIN.trigger(Events.NOT_UNDERSTAND_MSG, query=query_msg, response=response_msg, action=action)
            return
        self.DUSTBIN.trigger(Events.UNDERSTAND_MSG, query=query_msg, response=response_msg, action=action)
        if action == 'system.shutdown' :
            self.DUSTBIN.trigger(Events.REQ_SHUTDOWN)

        # VOICE and LANGUAGE COMMUNICATION
        if action == 'introduction' :
            self.DUSTBIN.trigger(Events.INTRODUCE_ROBOT)
        if action == 'say.hello' :
            self.DUSTBIN.trigger(Events.GREETINGS)
        if action == 'say.no' :
            self.DUSTBIN.trigger(Events.RESPONSE_NO)
        if action == 'say.yes' :
            self.DUSTBIN.trigger(Events.RESPONSE_YES)       
        if action == 'heard.yes' :
            self.DUSTBIN.trigger(Events.HEARD_YES)
        if action == 'heard.no' :
            self.DUSTBIN.trigger(Events.HEARD_NO)

        # IDENTIFY
        if action == 'identify.person' :
            # TODO make sure we don't trigger until person parameter is resolved (conversation may occur on dialogflow's side)
            pn = result.parameters['pronoun']
            self.DUSTBIN.trigger(Events.REQ_IDENTIFY_PERSON, pronoun=pn)
        if action == 'identify.object' :
            obj = result.parameters['object']
            self.DUSTBIN.trigger(Events.REQ_IDENTIFY_OBJECT, obj=obj)

        # FIND
        if action == 'find.person' :
            person = list(result.parameters['person'].values())[0]
            self.DUSTBIN.trigger(Events.REQ_FIND_PERSON, person=person)
        if action == 'find.object' :
            obj = result.parameters['object']
            self.DUSTBIN.trigger(Events.REQ_FIND_OBJECT, obj=obj)

        # GO
        if action == 'go.follow' :
            person = list(result.parameters['person'].values())[0]
            self.DUSTBIN.trigger(Events.REQ_FOLLOW, person=person)
        if action == 'go.wait' :
            obj = result.parameters['object']
            prep = result.parameters['preposition']
            self.DUSTBIN.trigger(Events.GO_WAIT, obj=obj, preposition=prep)

        # MOVEMENT TRICKS
        if action == 'do.figure_eight' :
            self.DUSTBIN.trigger(Events.REQ_FIGURE_EIGHT)
        if action == 'do.spin' :
            self.DUSTBIN.trigger(Events.REQ_SPIN, dps=80, times=1, reversed=True)
        if action == 'do.wiggle' :
            self.DUSTBIN.trigger(Events.REQ_WIGGLE)
    
    def interpretText(self, text) :
        response = None
        try :
            response = self._detect_intent_text(text)
            self._handleAction(response)
        except :
            self.DUSTBIN.log('FAILED TO INTERPRET FROM TEXT AND HANDLE IT!')
        return response

    def interpretFromWavFile(self, filename) :
        response = None
        try :
            response = self._detect_intent_audio(filename)
            self._handleAction(response)
        except :
            self.DUSTBIN.log('FAILED TO INTERPRET AUDIO AND HANDLE IT!')
        return response

    def interpretAudio(self) :
        sleep(2)
        filename = self.audioHandler.listen()
        return self.interpretFromWavFile(filename)
