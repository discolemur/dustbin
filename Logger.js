"use strict";

var fs = require('fs');
var glob = require('glob');
var util = require('util');

// Number of log files to keep.
const LOG_LIMIT = 5

/**
 * Logger class is just a helper for logging runtime information.
 */
class Logger {
  /**
   * 
   * @param {*} verbose Print to console as well as to file. Otherwise, prints to file only.
   * @param {*} persistent The lstream stays open even if this.end() is called. This is so that multiple instances of Dustbin can use the same logger, if desired.
   */
  constructor(verbose, persistent=false) {
    this.verbose = verbose;
    this.persistent = persistent;
    this.logfile = this.getLogfile();
    this.lstream = fs.createWriteStream(this.logfile);
    this.log('Logger initialized.');
  }
  /**
   * 
   * @param {*} files Given all available log files, removes the oldest one (based on the name, which should be the datestamp of creation).
   */
  removeOneLogfile(files) {
    fs.unlinkSync(files.sort()[0]);
  }
  /**
   * Get the next usable log filename (we remove the oldest if we already have 5 log files, keeping only 5 log files at any time.)
   * Log file names are date stamps for creation.
   */
  getLogfile() {
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
  /**
   * @param {*} any You can use any arguments, of any type, and any number of arguments. Results vary. Each part is output on a different line.
   */
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
  /**
   * Ends this instance of Logger.
   * @param {*} force End the lstream, even if the instance is set to "persistent" (i.e. this.persistent == true).
   */
  end(force=false) {
    if (!this.persistent || force) {
      this.lstream.end();
    }
  }
}

module.exports = Logger;