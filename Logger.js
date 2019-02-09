"use strict";

var fs = require('fs');
var glob = require('glob');

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
    fs.unlink(files.sort()[0]);
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
    for (var i = 0; i < arguments.length; i++) {
      this.lstream.write(`${arguments[i]}\n`);
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