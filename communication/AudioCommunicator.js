'use strict';

const { Events, EventListener } = require(`${__dirname}/Events.js`);

const uuid = require('uuid');
const util = require('util');
const fs = require('fs');
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

class AudioCommunicator {
  constructor(audio_timeout, dustbin) {
    this.DUSTBIN = dustbin;
    this.DUSTBIN.subscribe(new EventListener(Events.SPEAK, (kwargs) => this.speak(kwargs)));
    // this.speaker = SpeechEngine(dustbin.log, dustbin.hasInternet)
    // this.audioHandler = AudioHandler(audio_timeout)
  }

  /**
   * 
   * @param {*} kwargs REQUIRED ARGS: 'message'=string
   */
  speak(kwargs) {
    if (!this.DUSTBIN.silent) {
      this.speaker.say(kwargs.message);
    }
    this.DUSTBIN.log(kwargs.message);
  }
  /**
   * This takes the fields in the highest level of a dialogflow result, then sets its value to be the deepest value for that key in the convoluted structure of dialogflow's structValue json.
   * @param {*} parameters These are parameters from dialogflow result
   */
  toArgs(parameters) {
    let args = {};
    Object.keys(parameters.fields).map(name => {
      let tmpObj = parameters.fields[name]
      while (typeof tmpObj !== 'string') {
        if (tmpObj.kind == 'structValue') {
          tmpObj = tmpObj.structValue;
        } else if (tmpObj.fields !== undefined) {
          tmpObj = tmpObj.fields;
        } else if (tmpObj.kind == 'stringValue') {
          tmpObj = tmpObj.stringValue;
        } else {
          tmpObj = tmpObj[Object.keys(tmpObj)[0]];
        }
      }
      args[name] = tmpObj;
    })
    return args;
  }

  /**
   * 
   * @param {*} result The dialogflow result
   */
  _handleAction(result) {
    const action = result.action;
    const response_msg = result.fulfillmentText;
    const query_msg = result.queryText;
    let triggers = [];
    if (response_msg.length > 0)
      triggers.push(this.DUSTBIN.trigger(Events.SPEAK, { query: query_msg, message: response_msg, action: action }));

    if (action == 'input.unknown') {
      triggers.push(this.DUSTBIN.trigger(Events.NOT_UNDERSTAND_MSG, { query: query_msg, response: response_msg, action: action }));
      return;
    }
    triggers.push(this.DUSTBIN.trigger(Events.UNDERSTAND_MSG, { query: query_msg, response: response_msg, action: action }));
    switch (action) {
      case 'system.shutdown':
        triggers.push(this.DUSTBIN.trigger(Events.REQ_SHUTDOWN));
        break;

      // VOICE and LANGUAGE COMMUNICATION
      case 'introduction':
        triggers.push(this.DUSTBIN.trigger(Events.INTRODUCE_ROBOT));
        break;
      case 'say.hello':
        triggers.push(this.DUSTBIN.trigger(Events.GREETINGS));
        break;
      case 'say.no':
        triggers.push(this.DUSTBIN.trigger(Events.RESPONSE_NO));
        break;
      case 'say.yes':
        triggers.push(this.DUSTBIN.trigger(Events.RESPONSE_YES));
        break;
      case 'heard.yes':
        triggers.push(this.DUSTBIN.trigger(Events.HEARD_YES));
        break;
      case 'heard.no':
        triggers.push(this.DUSTBIN.trigger(Events.HEARD_NO));
        break;

      // IDENTIFY
      case 'identify.person':
        // TODO make sure we don't trigger until person parameter is resolved (conversation may occur on dialogflow's side)
        triggers.push(this.DUSTBIN.trigger(Events.REQ_IDENTIFY_PERSON, { request: "identify", what: "person" }));
        break;
      case 'identify.object':
        triggers.push(this.DUSTBIN.trigger(Events.REQ_IDENTIFY_OBJECT, { request: "identify", what: "object" }));
        break;

      // FIND
      case 'find.person':
        triggers.push(this.DUSTBIN.trigger(Events.REQ_FIND_PERSON, this.toArgs(result.parameters)))
        break;
      case 'find.object':
        triggers.push(this.DUSTBIN.trigger(Events.REQ_FIND_OBJECT, this.toArgs(result.parameters)));
        break;

      // GO
      case 'go.follow':
        triggers.push(this.DUSTBIN.trigger(Events.REQ_FOLLOW, this.toArgs(result.parameters)));
        break;
      case 'go.wait':
        let waitParams = this.toArgs(result.parameters);
        triggers.push(this.DUSTBIN.trigger(Events.GO_WAIT, { obj: waitParams.object, preposition: waitParams.preposition }));
        break;

      // MOVEMENT TRICKS
      case 'do.figure_eight':
        triggers.push(this.DUSTBIN.trigger(Events.REQ_FIGURE_EIGHT));
        break;
      case 'do.spin':
        triggers.push(this.DUSTBIN.trigger(Events.REQ_SPIN, { dps: 80, times: 1, reversed: true }));
        break;
      case 'do.wiggle':
        triggers.push(this.DUSTBIN.trigger(Events.REQ_WIGGLE));
        break;
    }
    return Promise.all(triggers);
  }

  /**
   * Returns a Promise
   * Returns the result of detect intent with texts as inputs.
   */
  interpretText(query) {
    let self = this;
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: _LANGUAGE_CODE
        }
      }
    };
    return sessionClient
      .detectIntent(request)
      .then(responses => {
        const result = responses[0].queryResult;
        // if (result.intent)
        // console.log(`  Intent: ${result.intent.displayName}`);
        self.DUSTBIN.log(`Query text: ${result.queryText}\n`);
        self.DUSTBIN.log(`Fulfillment text: ${result.fulfillmentText}\n`);
        self.DUSTBIN.trigger(Events.INTERPRETED_TEXT);
        return self._handleAction(result);
      })
      .catch(err => {
        self.DUSTBIN.log('FAILED TO INTERPRET FROM TEXT AND HANDLE IT!', err);
        throw err;
      });
  }
  interpretFromWavFile(filename) {
    let self = this;
    const readFile = util.promisify(fs.readFile);
    return readFile(filename).then(inputAudio => {
      const audioEncoding = 'AUDIO_ENCODING_LINEAR_16';
      const sampleRateHertz = 16000;
      return {
        session: sessionPath,
        queryInput: {
          audioConfig: {
            audioEncoding: audioEncoding,
            sampleRateHertz: sampleRateHertz,
            languageCode: _LANGUAGE_CODE
          }
        },
        inputAudio: inputAudio
      }
    }).then(request => {
      return sessionClient
        .detectIntent(request)
        .then(responses => {
          const result = responses[0].queryResult;
          // if (result.intent)
          // console.log(`  Intent: ${result.intent.displayName}`);
          self.DUSTBIN.log(`Query text: ${result.queryText}\n`);
          self.DUSTBIN.log(`Fulfillment text: ${result.fulfillmentText}\n`);
          self.DUSTBIN.trigger(Events.INTERPRETED_AUDIO)
          return self._handleAction(result);
        })
    }).catch(err => {
      self.DUSTBIN.log('FAILED TO INTERPRET FROM TEXT AND HANDLE IT!', err);
      throw err;
    });
  }

  interpretAudio() {
    const filename = this.audioHandler.listen();
    return this.interpretFromWavFile(filename);
  }
}

module.exports = {
  AudioCommunicator
}