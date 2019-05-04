/*
SocketCom Class

Knows nothing of dustbin. Simply sends message, relays response.
Previously I used MQTT, but now I want to use HTTP since I can block on waiting for response.
*/

const request = require('request');
// TODO figure out ethernet ip address, use that as host. Otherwise, use the one inside config.
const config = require(`${__dirname}/../config.json`);

class SocketCom {
  SocketCom() {
  }
  setResponseHandler(fn) {
    this.handleResponse = fn;
  }
  ready() {
    // TODO
    return Promise.resolve();
  }
  send(msg, requireResponse=false) {
    // TODO require response may mean make it a syncronous blocking call.
    // TODO use correct args.
    const self = this;
    const opts = {};
    request.get(msg, opts, (response)=>{
      self.handleRespones(response);
    })
  }
}

module.exports = SocketCom