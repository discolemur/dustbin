'use strict';

const { Events, EventListener } = require('../communication/Events.js');

// ############  ROOMBA CONSTANTS ###########
const ROOMBA_PORT = "/dev/ttyUSB0";
const BAUD_RATE = 115200;

// ############  GLOBALS      ###########
const DEG_PER_SEC = 40;
const TIMES_TO_SPIN = 1;
const REVERSED = false;

/*
"""
This is just a bogus class: a placeholder for future robot com classes.
"""
import CreateHTTP
*/

class Robot {
  constructor(dustbin) {
    this.DUSTBIN = dustbin;
    this.keepGoing = true;
    try {
      this.roomba = CreateHTTP.Create(ROOMBA_PORT, BAUD_RATE, CreateHTTP.SAFE_MODE, dustbin);
      this.roomba.resetPose();
      // Use this method to access location data
      const { px, py, th } = this.roomba.getPose();
    } catch (e) {
      this.DUSTBIN.log('Could not connect to Roomba.');
      this.roomba = null;
    }
    if (dustbin) {
      this.setListeners(Events);
    }
  }
  setListeners(Events) {
    class WiggleListener extends EventListener {
      callback() {
        return this.container.wiggle();
      }
    }
    class SpinListener extends EventListener {
      callback(kwargs) {
        return this.container.spin(kwargs.dps, kwargs.times, kwargs.reversed);
      }
    }
    class FigureEightListener extends EventListener {
      callback() {
        return this.container.figureEight();
      }
    }
    class FindListener extends EventListener {
      callback() {
        // this.DUSTBIN.trigger(Events.ROBOT_MOVED);
      }
    }
    class FollowListener extends EventListener {
      callback() {
        // this.DUSTBIN.trigger(Events.ROBOT_FOLLOWING);
      }
    }
    class WaitListener extends EventListener {
      callback() {
        // this.DUSTBIN.trigger(Events.ROBOT_WAITING);
      }
    }
    this.wiggleListener = new WiggleListener(this);
    this.figureEightListener = new FigureEightListener(this);
    this.spinListener = new SpinListener(this);
    this.findListener = new FindListener(this);
    this.followListener = new FollowListener(this);
    this.waitListener = new WaitListener(this);
    // ### Placeholders ###
    this.DUSTBIN.subscribe(Events.REQ_FIND_OBJECT, this.findListener);
    this.DUSTBIN.subscribe(Events.REQ_FIND_PERSON, this.findListener);
    this.DUSTBIN.subscribe(Events.REQ_FOLLOW, this.followListener);
    this.DUSTBIN.subscribe(Events.GO_WAIT, this.waitListener);
    // ### Finished ###
    this.DUSTBIN.subscribe(Events.REQ_WIGGLE, this.wiggleListener);
    this.DUSTBIN.subscribe(Events.REQ_SPIN, this.spinListener);
    this.DUSTBIN.subscribe(Events.REQ_FIGURE_EIGHT, this.figureEightListener);
  }
  wiggle() {
    if (this.roomba == null) {return;}
      this.roomba.go(0, 40);
      setTimeout(() => {
        this.roomba.go(0, -40);
        setTimeout(() => {
          this.roomba.go(0, 40);
          setTimeout(this.roomba.go(0, 0), 400);
        }, 800);
      }, 400);
    this.DUSTBIN.trigger(Events.ROBOT_MOVED);
  }
  move(position) {
    if (this.roomba == null) {return;}
    this.DUSTBIN.log(`Going to position ${position}`);
    this.DUSTBIN.trigger(Events.ROBOT_MOVED);
  }
  figureEight() {
    if (this.roomba == null) {return;}
    // Will do a figure eightor this.toTrigger.qsize() > 0or this.toTrigger.qsize() > 0.
    this.DUSTBIN.trigger(Events.ROBOT_MOVED);
  }
  // degrees per second, number of times rotating
  spin(dps = DEG_PER_SEC, times = TIMES_TO_SPIN, reversed = REVERSED) {
    if (this.roomba == null) {return;}
    if (!this.roomba) {
      return;
    }
    let sign = 1;
    if (reversed) {
      sign = -1;
    }
    for (let i in range(times)) {
      this.roomba.go(0, dps * sign);
      time.sleep(times * 360 / dps);
    }
    this.DUSTBIN.trigger(Events.ROBOT_MOVED);
  }
  end() {
    if (this.roomba == null) {return;}
    this.DUSTBIN.log('CLOSING ROBOT CONNECTION');
    if (this.roomba) {
      this.roomba.close();
    }
    this.keepGoing = false;
  }
}

function main() {
  // main code
  robot = Robot(null);
  robot.wiggle();
  robot.spin();
  robot.figureEight();
  robot.end();
}

if (require.main === module) {
  main();
}

module.exports = Robot;