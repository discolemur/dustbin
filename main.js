#! /usr/bin/env node
'use strict';

var argparse = require('argparse');

const Logger = require('./Logger.js');
const Dustbin = require('./Dustbin.js');

function main(timeout, verbose, silent) {
  let dustbin = new Dustbin(new Logger(verbose), timeout, silent);
  try {
    dustbin.run();
  } catch (e) {
    dustbin.log(`Error occurred. ${e} Program died.`);
  }
}

let parser = new argparse.ArgumentParser();
parser.addArgument(['--verbose', '-v'], { action: "storeTrue", default: false, help: "Print log to console (still logs in the file)." });
parser.addArgument(['--silent', '-s'], { action: "storeTrue", default: false, help: "Do not play the audio for the responses." });
parser.addArgument(['--timeout', '-t'], { type: 'int', default: 5, help: "Audio timeout. This is how long it will listen for your response before giving up." });
const args = parser.parseArgs()
main(args.timeout, args.verbose, args.silent)