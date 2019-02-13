"use strict";

var fs = require('fs');
var glob = require('glob');
var util = require('util');

// Number of log files to keep.
const LOG_LIMIT = 5

class Logger {
  constructor(verbose, persistent=false) {
    this.verbose = verbose;
    this.persistent = persistent;
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
    let args = arguments;
    if (arguments.length == 1 && typeof arguments[0] !== 'string') {
      args = arguments[0];
    }
    for (let i = 0; i < args.length; i++) {
      if (Array.isArray(args[i])) {
        this.lstream.write('[');
        args[i].map(x => this.log(x));
        this.lstream.write(']');
      } else if (typeof args[i] === 'object') {
        this.lstream.write(util.inspect(args[i]));
        this.lstream.write('\n');
      } else {
        this.lstream.write(`${args[i]}\n`);
      }
      if (this.verbose) {
        console.log(args[i]);
      }
    }
  }
  end(force=false) {
    if (!this.persistent || force) {
      this.lstream.end();
    }
  }
}

module.exports = Logger;