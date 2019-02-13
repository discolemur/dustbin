"use strict";

var fs = require('fs');
var glob = require('glob');
var util = require('util');

// Number of log files to keep.
const LOG_LIMIT = 5

class Logger {
  constructor(verbose) {
    this.verbose = verbose;
    this.logfile = this.getLogfile();
    this.lstream = fs.createWriteStream(this.logfile);
    this.log('Logger initialized.');
  }
  removeOneLogfile(files) {
    fs.unlinkSync(files.sort()[0]);
  }
  getLogfile(callback) {
    const logDir = __dirname + '/logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, err => {});
    }
    const filename = `${logDir}/${Date.now()}.log`;
    const files = glob.sync(`${logDir}/*.log`);
    if (files.length >= LOG_LIMIT) {
      this.removeOneLogfile(files);
    }
    return filename;
  }
  log() {
    if (!this.lstream.writable) {
      return;
    }
    for (let i = 0; i < arguments.length; i++) {
      if (Array.isArray(arguments[i])) {
        this.lstream.write('[');
        arguments[i].map(x => this.log(x));
        this.lstream.write(']');
      } else if (typeof arguments[i] === 'object') {
        this.lstream.write(util.inspect(arguments[i]));
      } else {
        this.lstream.write(`${arguments[i]}\n`);
      }
      if (this.verbose) {
        console.log(arguments[i]);
      }
    }
  }
  end() {
    this.lstream.end();
  }
}

module.exports = Logger;