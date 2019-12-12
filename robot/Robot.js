'use strict';

// Options:
// https://www.npmjs.com/package/create2
// https://www.npmjs.com/package/create-oi

const { Events, EventListener } = require('../communication/Events.js');
const create = require('create2');

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

// TODO: also have a feature where the robot turns to face a person when learning who the person is.
// TODO: to learn multiple people, can maybe use a dimension reduction on the second to last output of the model, and divide the learning space by the people known.

class Robot {
  constructor(dustbin) {
    if (dustbin === null) {
      dustbin = {
        log: console.log,
        subscribe: ()=>{},
        trigger: ()=>{}
      }
    }
    this.DUSTBIN = dustbin;
    this.keepGoing = true;
    this.connected = false;
    this.roomba = null;
    let timedout = false;
    // TODO: handle this asyncronous stuff properly.
    setTimeout(()=>{
      timedout = true;
    }, 5000);
    while (!this.connected || !timedout) {
      this.establish_connection();
    }
    if (dustbin) {
      this.setListeners(Events);
    }
  }
  establish_connection() {
    try {
      create.ports((pa)=>{
        const port = pa.filter(port=>port.vendorId == '0403' && port.productId == '6015');
        create.open(port.comName, callback=(roomba)=>{
          this.connected = true;
          this.roomba = roomba;
          this.roomba.safe();
        })
      })
    } catch (e) {
      if (!(e instanceof TypeError)) {
        throw (e);
      }
      this.DUSTBIN.log('Error when connecting to Roomba.', e);
    }
    this.DUSTBIN.log('Could not connect to roomba.')
  }
  setListeners(Events) {
    this.DUSTBIN.subscribe(new EventListener(Events.REQ_FIND_OBJECT, (kwargs)=>this.find(kwargs)));
    this.DUSTBIN.subscribe(new EventListener(Events.REQ_FIND_PERSON, (kwargs)=>this.find(kwargs)));
    this.DUSTBIN.subscribe(new EventListener(Events.REQ_FOLLOW, (kwargs)=>this.follow(kwargs)));
    this.DUSTBIN.subscribe(new EventListener(Events.GO_WAIT, (kwargs)=>this.wait(kwargs)));
    // ### Finished ###
    this.DUSTBIN.subscribe(new EventListener(Events.REQ_WIGGLE, (kwargs)=>this.wiggle(kwargs)));
    this.DUSTBIN.subscribe(new EventListener(Events.REQ_FIGURE_EIGHT, (kwargs)=>this.figureEight(kwargs)));
    this.DUSTBIN.subscribe(new EventListener(Events.REQ_SPIN, (kwargs)=>this.spin(kwargs.dps, kwargs.times, kwargs.reversed)));
  }
  find() {
    // TODO
    // this.DUSTBIN.trigger(Events.ROBOT_MOVED);
  }
  follow() {
    // TODO
    // this.DUSTBIN.trigger(Events.ROBOT_FOLLOWING);
  }
  wait() {
    // TODO
    // this.DUSTBIN.trigger(Events.ROBOT_WAITING);
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
    // TODO Will do a figure eightor this.toTrigger.qsize() > 0or this.toTrigger.qsize() > 0.
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
      setTimeout(
        ()=>this.roomba.go(0, dps * sign),
        times * 360 / dps
      );
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
  let robot = new Robot(null);
  robot.wiggle();
  robot.spin();
  robot.figureEight();
  robot.end();
}

if (require.main === module) {
  main();
}

module.exports = Robot;