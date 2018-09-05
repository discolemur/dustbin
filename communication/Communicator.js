'use strict';

const { Events, EventListener } = require('./Events.js');

const _SESSION_ID = `dev_sesh_${Date.now()}`;
const _PROJECT_ID = 'dust-bin-97d2d';
const _LANGUAGE_CODE = 'en-US';

const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(_PROJECT_ID, _SESSION_ID);

// import dialogflow

// from lib.SpeechEngine import SpeechEngine
// from lib.AudioHandler import AudioHandler
// from Events import Events

// """
// If mplayer is throwing stupid errors, do this:
// Add the following to your $HOME/.mplayer/config file:
//   lirc=no
// """

// """
// If shows error
// ALSA lib . . . Unknown PCM cards.pcm.{cardname}

// Then for each error {cardname} change the following line in /usr/share/alsa/alsa.conf
// ORIGINAL:    pcm.{cardname} cards.pcm.{cardname}
// NEW:         pcm.{cardname} cards.pcm.default
// """

class SpeakListener extends EventListener {
  callback(kwargs) {
    if (!kwargs.response) {
      return null;
    }
    return this.container.speak(kwargs);
  }
}

class Communicator {
  constructor(audio_timeout, dustbin) {
    this.DUSTBIN = dustbin;
    this.speakListener = new SpeakListener(this);
    this.DUSTBIN.subscribe(Events.SPEAK, this.speakListener)
    // this.speaker = SpeechEngine(dustbin.log, dustbin.hasInternet)
    // this.audioHandler = AudioHandler(audio_timeout)
  }

  //     def _detect_intent_text(self, text):
  //         """Returns the result of detect intent with texts as inputs.
  //         Using the same `session_id` between requests allows continuation
  //         of the conversation."""
  //         session_client = dialogflow.SessionsClient()
  //         session = session_client.session_path(_PROJECT_ID, _SESSION_ID)
  //         self.DUSTBIN.log('Session path: {}\n'.format(session))
  //         text_input = dialogflow.types.TextInput(
  //             text=text, language_code=_LANGUAGE_CODE)
  //         query_input = dialogflow.types.QueryInput(text=text_input)
  //         response = session_client.detect_intent(
  //             session=session, query_input=query_input)
  //         self.DUSTBIN.log('=' * 20)
  //         self.DUSTBIN.log('Query text: {}'.format(response.query_result.query_text))
  //         self.DUSTBIN.log('Detected intent: {} (confidence: {})\n'.format(
  //             response.query_result.intent.display_name,
  //             response.query_result.intent_detection_confidence))
  //         self.DUSTBIN.log('Fulfillment text: {}\n'.format(response.query_result.fulfillment_text))
  //         self.DUSTBIN.trigger(Events.RECEIVE_TEXT)
  //         return response

  //     def _detect_intent_audio(self, audio_file_path):
  //         """Returns the result of detect intent with an audio file as input.
  //         Using the same `session_id` between requests allows continuation
  //         of the conversation."""
  //         session_client = dialogflow.SessionsClient()
  //         # Note: hard coding audio_encoding and sample_rate_hertz for simplicity.
  //         audio_encoding = dialogflow.enums.AudioEncoding.AUDIO_ENCODING_LINEAR_16
  //         #sample_rate_hertz = 16000
  //         sample_rate_hertz = self.audioHandler.RATE
  //         session = session_client.session_path(_PROJECT_ID, _SESSION_ID)
  //         self.DUSTBIN.log('Session path: {}\n'.format(session))
  //         with open(audio_file_path, 'rb') as audio_file:
  //             input_audio = audio_file.read()
  //         audio_config = dialogflow.types.InputAudioConfig(
  //             audio_encoding=audio_encoding, language_code=_LANGUAGE_CODE,
  //             sample_rate_hertz=sample_rate_hertz)
  //         query_input = dialogflow.types.QueryInput(audio_config=audio_config)
  //         response = session_client.detect_intent(
  //             session=session, query_input=query_input,
  //             input_audio=input_audio)
  //         self.DUSTBIN.log('=' * 20)
  //         self.DUSTBIN.log('Query text: {}'.format(response.query_result.query_text))
  //         self.DUSTBIN.log('Detected intent: {} (confidence: {})\n'.format(
  //             response.query_result.intent.display_name,
  //             response.query_result.intent_detection_confidence))
  //         self.DUSTBIN.log('Fulfillment text: {}\n'.format(response.query_result.fulfillment_text))
  //         self.DUSTBIN.trigger(Events.HEAR_AUDIO)
  //         return response

  //     # REQUIRED ARGS: 'response'=string
  //     def speak(self, kwargs) :
  //         if self.DUSTBIN.silent :
  //             self.DUSTBIN.getLogLock().acquire()
  //             # Keep this print.
  //             print kwargs['response']
  //             self.DUSTBIN.getLogLock().release()
  //         else :
  //             self.speaker.say(kwargs['response'])

  _handleAction(response) {
    const result = response.queryResult;
    const action = result.action;
    const response_msg = result.fulfillmentText;
    const query_msg = result.queryText;

    // BASIC COMMUNICATION STATES
    if (len(response_msg) > 0)
      this.DUSTBIN.trigger(Events.SPEAK, query = query_msg, response = response_msg, action = action)
    if (action == 'input.unknown') {
      this.DUSTBIN.trigger(Events.NOT_UNDERSTAND_MSG, query = query_msg, response = response_msg, action = action)
      return
    }
    this.DUSTBIN.trigger(Events.UNDERSTAND_MSG, query = query_msg, response = response_msg, action = action)
    if (action == 'system.shutdown')
      this.DUSTBIN.trigger(Events.REQ_SHUTDOWN)

    // VOICE and LANGUAGE COMMUNICATION
    if (action == 'introduction')
      this.DUSTBIN.trigger(Events.INTRODUCE_ROBOT)
    if (action == 'say.hello')
      this.DUSTBIN.trigger(Events.GREETINGS)
    if (action == 'say.no')
      this.DUSTBIN.trigger(Events.RESPONSE_NO)
    if (action == 'say.yes')
      this.DUSTBIN.trigger(Events.RESPONSE_YES)
    if (action == 'heard.yes')
      this.DUSTBIN.trigger(Events.HEARD_YES)
    if (action == 'heard.no')
      this.DUSTBIN.trigger(Events.HEARD_NO)

    // IDENTIFY
    if (action == 'identify.person') {
      // TODO make sure we don't trigger until person parameter is resolved (conversation may occur on dialogflow's side)
      const pn = result.parameters['pronoun'];
      this.DUSTBIN.trigger(Events.REQ_IDENTIFY_PERSON, pronoun = pn)
    }
    if (action == 'identify.object') {
      const obj = result.parameters['object']
      this.DUSTBIN.trigger(Events.REQ_IDENTIFY_OBJECT, obj = obj)
    }

    // FIND
    if (action == 'find.person') {
      const person = list(result.parameters['person'].values())[0]
      this.DUSTBIN.trigger(Events.REQ_FIND_PERSON, person = person)
    }
    if (action == 'find.object') {
      const obj = result.parameters['object']
      this.DUSTBIN.trigger(Events.REQ_FIND_OBJECT, obj = obj)
    }

    // GO
    if (action == 'go.follow') {
      const person = list(result.parameters['person'].values())[0]
      this.DUSTBIN.trigger(Events.REQ_FOLLOW, person = person)
    }
    if (action == 'go.wait') {
      const obj = result.parameters['object']
      const prep = result.parameters['preposition'];
      this.DUSTBIN.trigger(Events.GO_WAIT, obj = obj, preposition = prep);
    }

    // MOVEMENT TRICKS
    if (action == 'do.figure_eight')
      this.DUSTBIN.trigger(Events.REQ_FIGURE_EIGHT)
    if (action == 'do.spin')
      this.DUSTBIN.trigger(Events.REQ_SPIN, dps = 80, times = 1, reversed = True)
    if (action == 'do.wiggle')
      this.DUSTBIN.trigger(Events.REQ_WIGGLE)
  }
  interpretText(query) {
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: _LANGUAGE_CODE,
        },
      },
    };
    return sessionClient
      .detectIntent(request)
      .then(responses => {
        // const result = responses[0].queryResult;
        // console.log(`  Query: ${result.queryText}`);
        // console.log(`  Response: ${result.fulfillmentText}`);
        // if (result.intent)
        // console.log(`  Intent: ${result.intent.displayName}`);
        return this._handleAction(responses[0]);
      })
      .catch(err => {
        this.DUSTBIN.log('FAILED TO INTERPRET FROM TEXT AND HANDLE IT!', err)
      });
  }
  interpretFromWavFile(filename) {
    //     def interpretFromWavFile(self, filename) :
    //         response = None
    //         try :
    //             response = self._detect_intent_audio(filename)
    //             self._handleAction(response)
    //         except :
    //             self.DUSTBIN.log('FAILED TO INTERPRET AUDIO AND HANDLE IT!')
    //         return response
    return Promise.resolve();
  }

  interpretAudio(callback) {
    const filename = this.audioHandler.listen();
    return callback(this.interpretFromWavFile(filename));
  }
}

module.exports = {
  SpeakListener,
  Communicator
}