'use strict';

// TODO use async.doWhilst or something else rather than all the crazy stuff I've got set up so far.
const numJitters = 15

const { Events, EventListener } = require('../communication/Events.js');

const KNOWN_PEOPLE_FILE = `${__dirname}/models/faces.json`;
const KNOWN_PEOPLE = require(KNOWN_PEOPLE_FILE);
const KNOWN_OBJECTS_FILE = `${__dirname}/models/faces.json`;
const KNOWN_OBJECTS = require(KNOWN_OBJECTS_FILE);

class FindObjectListener extends EventListener {
  callback(kwargs) {
    return this.container._handleFindObject(kwargs.obj);
  }
}
class IdentifyObjectListener extends EventListener {
  callback(kwargs) {
    return this.container._handleIdentifyObject(kwargs.obj);
  }
}
class FindPersonListener extends EventListener {
  callback(kwargs) {
    return this.container._handleFindPerson(kwargs.person);
  }
}
class IdentifyPersonListener extends EventListener {
  callback(kwargs) {
    return this.container._handleIdentifyPerson(kwargs.pronoun);
  }
}

class Vision {
  constructor(dustbin) {
    this.DUSTBIN = dustbin;
    this.fr = require('face-recognition');
    this.detector = this.fr.AsyncFaceDetector();
    this.recognizer = this.fr.AsyncFaceRecognizer();

    const known_objects = [];

    if (KNOWN_PEOPLE) {
      if (Object.keys(KNOWN_PEOPLE).length > 0) {
        this.recognizer.load(KNOWN_PEOPLE);
      }
    }

    this._subscribeListeners();
  }

  result(success, person) {
    return { success: success, person: person };
  }

  // ''' HANDLERS '''
  _handleFindObject(obj) {
    this.DUSTBIN.log('Find object is not yet implemented.');
    // this.DUSTBIN.trigger(Events.OBJECT_FOUND, {obj : obj});
  }
  _handleIdentifyObject(obj) {
    this.DUSTBIN.log('Identify object is not yet implemented.');
    // this.DUSTBIN.trigger(Events.OBJECT_IDENTIFIED, {obj : obj});
  }
  _handleFindPerson(person) {
    this.DUSTBIN.log('Find person is not yet implemented.');
    // this.DUSTBIN.trigger(Events.PERSON_FOUND, {person : person});
    this.DUSTBIN.trigger(Events.SPEAK, { message: `Sorry, I couldn't find ${person}.` });
  }

  // TODO get face image to analyze
  _handleIdentifyPerson(pronoun) {
    this.faceImage = null;
    return this.identifyPerson(faceImage).then(result => {
      const { success, person } = result;
      if (success) {
        this.dustbin.trigger(PERSON_IDENTIFIED, { pronoun: pronoun });
        this.DUSTBIN.trigger(Events.SPEAK, { message: `I know ${pronoun}. ${pronoun} is ${person}` });
      } else {
        this.dustbin.trigger(PERSON_NOT_IDENTIFIED, { pronoun: pronoun });
        if (pronoun == 'I') {
          this.DUSTBIN.trigger(Events.SPEAK, { message: `Sorry, I don't know who you are.` });
        } else if (pronoun == 'they' || pronoun == 'them') {
          this.DUSTBIN.trigger(Events.SPEAK, { message: `Sorry, I don't know who they are.` });
        } else {
          this.DUSTBIN.trigger(Events.SPEAK, { message: `Sorry, I don't know who ${pronoun} is.` });
        }
      }
    })
  }

  /**
   * If runs too slowly, try decreasing numJitters (which modifies the images slightly to make it more accurate detecting face from many angles.)
   * @param {*} name Name of person
   * @param {*} faces Pictures of person
   */
  learnPerson(name, faces) {
    this.recognizer.addFaces(faces, name, numJitters);
  }

  /**
   * Returns a promise that resolves {success, person}
   * @param {*} faceImage 
   */
  identifyPerson(faceImage) {
    if (!faceImage) {
      return Promise.resolve(false);
    }
    let self = this;
    return this.recognizer.predictBest(faceImage)
      .then((bestPrediction) => {
        self.dustbin.log(`Identified ${bestPrediction.className} with accuracy ${bestPrediction.distance}.`)
        return self.result(true, bestPrediction.className);
      })
      .catch((error) => {
        self.dustbin.log(error);
        return self.result(false);
      })
  }

  // ''' METHODS '''
  _subscribeListeners() {
    this.FOL = new FindObjectListener(this);
    this.IOL = new IdentifyObjectListener(this);
    this.FPL = new FindPersonListener(this);
    this.IPL = new IdentifyPersonListener(this);
    this.DUSTBIN.subscribe(Events.REQ_FIND_OBJECT, this.FOL);
    this.DUSTBIN.subscribe(Events.REQ_IDENTIFY_OBJECT, this.IOL);
    this.DUSTBIN.subscribe(Events.REQ_FIND_PERSON, this.FPL);
    this.DUSTBIN.subscribe(Events.REQ_IDENTIFY_PERSON, this.IPL);
  }
  stop() {
    this.DUSTBIN.log('Saving learned faces...');
    const fs = require('fs')
    const modelState = this.recognizer.serialize()
    fs.writeFileSync(KNOWN_PEOPLE_FILE, JSON.stringify(modelState))
    this.DUSTBIN.log('ENDING VISION THREAD');
  }
  run() {
    try {
      async.doWhilst(() => {
        setTimeout(() => {
          this.DUSTBIN.log('Vision process continues.');
        }, 4000)
      }, this.DUSTBIN.keepGoing);
    } catch (e) {
      this.DUSTBIN.log('Vision process had fatal error.', e);
      print('Vision process had fatal error.', e);
    }
    this.DUSTBIN.log('VISION OFFICIALLY DEAD.');
  }
}

module.exports = {
  FindObjectListener,
  IdentifyObjectListener,
  FindPersonListener,
  IdentifyPersonListener,
  Vision
}