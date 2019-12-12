/*
SocketCom Class

Knows nothing of dustbin. Simply sends message, relays response.
Previously I used MQTT, but now I want to use HTTP since I can block on waiting for response.
*/

const rp = require('request-promise');
// TODO figure out ethernet ip address, use that as host. Otherwise, use the one inside config.
const config = require(`${__dirname}/../config.json`);

class SocketCom {
  SocketCom() {
  }
  setResponseHandler(fn) {
    this.handleResponse = fn;
  }
  /**
   * Send message via http.
   * @param {*} jsonMsg Must contain keys {request: '', what: ''}
   */
  send(jsonMsg) {
    const self = this;
    let referer = `/${jsonMsg.request}/${jsonMsg.what}`
    const URI = `http://${config.http_host}:${config.http_port}/${referer}`;
    var options = {
      uri: URI,
      //qs: {
      //  access_token: config.token // -> uri + '?access_token=xxxxx%20xxxxx'
      //},
      headers: {
        'User-Agent': 'Request-Promise',
        'Referer': referer
      },
      json: true // Automatically parses the JSON string in the response
    };
    return rp(options)
      .then(function (res) {
        return self.handleResponse(res);
      })
      .catch(function (err) {
        return self.handleResponse(err);
      });
  }
}

module.exports = SocketCom