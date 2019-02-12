'use strict';

const { Events, EventListener } = require('./Events.js');

const uuid = require('uuid');
const dialogflow = require('dialogflow');
const _SESSION_ID = uuid.v4();
const _PROJECT_ID = 'dust-bin-97d2d';
const _LANGUAGE_CODE = 'en-US';

// Create a new session
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(_PROJECT_ID, _SESSION_ID);

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

  //   # REQUIRED ARGS: 'response'=string
  speak(kwargs) {
    if (!this.DUSTBIN.silent) {
      self.speaker.say(kwargs.response);
    }
    this.DUSTBIN.log(kwargs.response);
  }

  _handleAction(result) {
    const action = result.action;
    const response_msg = result.fulfillmentText;
    const query_msg = result.queryText;
    if (response_msg.length > 0)
      this.DUSTBIN.trigger(Events.SPEAK, { query: query_msg, response: response_msg, action: action })

    if (action == 'input.unknown') {
      this.DUSTBIN.trigger(Events.NOT_UNDERSTAND_MSG, { query: query_msg, response: response_msg, action: action })
      return;
    }
    this.DUSTBIN.trigger(Events.UNDERSTAND_MSG, { query: query_msg, response: response_msg, action: action })
    switch (action) {
      case 'system.shutdown':
        this.DUSTBIN.trigger(Events.REQ_SHUTDOWN)
        break;

      // VOICE and LANGUAGE COMMUNICATION
      case 'introduction':
        this.DUSTBIN.trigger(Events.INTRODUCE_ROBOT)
        break;
      case 'say.hello':
        this.DUSTBIN.trigger(Events.GREETINGS);
        break;
      case 'say.no':
        this.DUSTBIN.trigger(Events.RESPONSE_NO)
        break;
      case 'say.yes':
        this.DUSTBIN.trigger(Events.RESPONSE_YES)
        break;
      case 'heard.yes':
        this.DUSTBIN.trigger(Events.HEARD_YES)
        break;
      case 'heard.no':
        this.DUSTBIN.trigger(Events.HEARD_NO)
        break;

      // IDENTIFY
      case 'identify.person':
        // TODO make sure we don't trigger until person parameter is resolved (conversation may occur on dialogflow's side)
        this.DUSTBIN.trigger(Events.REQ_IDENTIFY_PERSON, { pronoun: result.parameters['pronoun'] });
        break;
      case 'identify.object':
        this.DUSTBIN.trigger(Events.REQ_IDENTIFY_OBJECT, { obj: result.parameters['object'] });
        break;

      // FIND
      case 'find.person':
        this.DUSTBIN.trigger(Events.REQ_FIND_PERSON, { person: list(result.parameters['person'].values())[0] });
        break;
      case 'find.object':
        this.DUSTBIN.trigger(Events.REQ_FIND_OBJECT, { obj: result.parameters['object'] });
        break;

      // GO
      case 'go.follow':
        this.DUSTBIN.trigger(Events.REQ_FOLLOW, { person: list(result.parameters['person'].values())[0] })
        break;
      case 'go.wait':
        this.DUSTBIN.trigger(Events.GO_WAIT, { obj: result.parameters['object'], preposition: result.parameters['preposition'] });
        break;

      // MOVEMENT TRICKS
      case 'do.figure_eight':
        this.DUSTBIN.trigger(Events.REQ_FIGURE_EIGHT)
        break;
      case 'do.spin':
        this.DUSTBIN.trigger(Events.REQ_SPIN, { dps: 80, times: 1, reversed: True })
        break;
      case 'do.wiggle':
        this.DUSTBIN.trigger(Events.REQ_WIGGLE)
        break;
    }
  }

  /**
   * Returns a Promise
   * Returns the result of detect intent with texts as inputs.
   */
  interpretText(query) {
    let self = this;
    return new Promise(function (resolve, reject) {
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: query,
            languageCode: _LANGUAGE_CODE,
          },
        },
      };
      sessionClient
        .detectIntent(request)
        .then(responses => {
          const result = responses[0].queryResult;
          // console.log(`  Query: ${result.queryText}`);
          // console.log(`  Response: ${result.fulfillmentText}`);
          // if (result.intent)
          // console.log(`  Intent: ${result.intent.displayName}`);
          self.DUSTBIN.log(`Query text: ${result.queryText}\n`);
          self.DUSTBIN.log(`Fulfillment text: ${result.fulfillmentText}\n`);
          self.DUSTBIN.trigger(Events.RECEIVE_TEXT);
          resolve(self._handleAction(result));
        })
        .catch(err => {
          self.DUSTBIN.log('FAILED TO INTERPRET FROM TEXT AND HANDLE IT!', err);
          reject(err);
        });
    })
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

  interpretAudio() {
    const filename = this.audioHandler.listen();
    return this.interpretFromWavFile(filename);
  }
}

module.exports = {
  SpeakListener,
  Communicator
}