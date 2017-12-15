import dialogflow

from SpeechEngine import SpeechEngine
from Listener import Listener
from Events import Events

_SESSION_ID = 'dev_sesh'
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

class Communicator :
    def __init__(self, audio_timeout, dustbin) :
        self.speaker = SpeechEngine(dustbin)
        self.listener = Listener(audio_timeout, dustbin)
        self.DUSTBIN = dustbin
    
    def _detect_intent_text(self, text):
        """Returns the result of detect intent with texts as inputs.
        Using the same `session_id` between requests allows continuation
        of the conversaion."""
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
        self.DUSTBIN.log('Fulfillment text: {}\n'.format(
            response.query_result.fulfillment_text))
        self.speaker.say(response.query_result.fulfillment_text)
        return response

    def _detect_intent_audio(self, audio_file_path):
        """Returns the result of detect intent with an audio file as input.
        Using the same `session_id` between requests allows continuation
        of the conversation."""
        session_client = dialogflow.SessionsClient()
        # Note: hard coding audio_encoding and sample_rate_hertz for simplicity.
        audio_encoding = dialogflow.enums.AudioEncoding.AUDIO_ENCODING_LINEAR_16
        #sample_rate_hertz = 16000
        sample_rate_hertz = self.listener.RATE
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
        self.DUSTBIN.log('Fulfillment text: {}\n'.format(
        response.query_result.fulfillment_text))
        self.speaker.say(response.query_result.fulfillment_text)
        return response

    def interpretAudio(self) :
        filename = self.listener.listen()
        response = None
        try :
            response = self._detect_intent_audio(filename)
            self.handleAction(response)
        except :
            response = None
        return response

    def handleAction(self, response) :
        action = response.query_result.action
        if action == 'input.unknown' :
            self.DUSTBIN.trigger(Events.NOT_UNDERSTAND_MSG)
            return
        self.DUSTBIN.trigger(Events.UNDERSTAND_MSG)
        if action == 'system.shutdown' :
            self.DUSTBIN.trigger(Events.REQ_SHUTDOWN)
        if action == 'visual.identify' :
            self.DUSTBIN.trigger(Events.REQ_IDENTIFY_PERSON, response.query_result.parameters.person[0])
        if action == 'go.follow' :
            person = ''
            if response.query_result.parameters.relative.length > 0 :
                person = response.query_result.parameters.relative
            if response.query_result.parameters.person.length > 0 :
                person = response.query_result.parameters.person
            if response.query_result.parameters['given-name'].length > 0 :
                person = response.query_result.parameters['given-name']
            self.DUSTBIN.trigger(Events.REQ_FOLLOW, {person: person})
        # TODO fill in the rest.
    
    def interpretText(self, text) :
        return self._detect_intent_text(text)