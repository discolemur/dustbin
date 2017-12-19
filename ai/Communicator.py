import dialogflow

from lib.SpeechEngine import SpeechEngine
from lib.AudioHandler import AudioHandler
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
        self.speaker = SpeechEngine(dustbin.log, dustbin.hasInternet)
        self.audioHandler = AudioHandler(audio_timeout)
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
        if not self.DUSTBIN.silent :
            self.speaker.say(response.query_result.fulfillment_text)
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
        self.DUSTBIN.log('Fulfillment text: {}\n'.format(
        response.query_result.fulfillment_text))
        if not self.DUSTBIN.silent :
            self.speaker.say(response.query_result.fulfillment_text)
        self.DUSTBIN.trigger(Events.HEAR_AUDIO)
        return response

    def _handleAction(self, response) :
        result = response.query_result
        action = result.action
        if action == 'input.unknown' :
            self.DUSTBIN.trigger(Events.NOT_UNDERSTAND_MSG)
            return
        self.DUSTBIN.trigger(Events.UNDERSTAND_MSG)
        if action == 'system.shutdown' :
            self.DUSTBIN.trigger(Events.REQ_SHUTDOWN)
        if action == 'introduction' :
            self.DUSTBIN.trigger(Events.INTRODUCE_ROBOT)
        if action == 'identify.person' :
            params = {
                'person' : result.parameters['person']
            }
            # TODO make sure we don't trigger until person parameter is resolved (conversation may occur on dialogflow's side)
            self.DUSTBIN.trigger(Events.REQ_IDENTIFY_PERSON, params)
        if action == 'find.person' :
            params = {
                'relative' : result.parameters['relative'],
                'person' : result.parameters['person']
            }
            self.DUSTBIN.trigger(Events.REQ_FIND_PERSON, params)
        if action == 'go.follow' :
            params = {
                'relative' : result.parameters['relative'],
                'person' : result.parameters['person']
            }
            self.DUSTBIN.trigger(Events.REQ_FOLLOW, params)
        if action == 'go.wait' :
            params = {
                'object' : result.parameters['object'],
                'preposition' : result.parameters['preposition']
            }
            self.DUSTBIN.trigger(Events.GO_WAIT, params)
        if action == 'say.hello' :
            self.DUSTBIN.trigger(Events.GREETINGS)
        if action == 'say.yes' :
            self.DUSTBIN.trigger(Events.YES)
        if action == 'say.no' :
            self.DUSTBIN.trigger(Events.NO)
        if action == 'identify.object' :
            params = {
                'object' : result.parameters['object'],
            }
            self.DUSTBIN.trigger(Events.REQ_IDENTIFY_OBJECT, params)
        if action == 'find.object' :
            params = {
                'object' : result.parameters['object'],
            }
            self.DUSTBIN.trigger(Events.REQ_FIND_OBJECT, params)
    
    def interpretText(self, text) :
        response = None
        try :
            response = self._detect_intent_text(text)
            self._handleAction(response)
        except :
            response = None
        return response

    def interpretAudio(self) :
        filename = self.audioHandler.listen()
        response = None
        try :
            response = self._detect_intent_audio(filename)
            self._handleAction(response)
        except :
            response = None
        return response
