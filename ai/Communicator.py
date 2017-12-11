#! /usr/bin/env python

import apiai

CLIENT_ACCESS_TOKEN = 'c76a23378b774572aaf5d3cd4af5b0cb' 
SESSION_ID = 'dustbin_sesh'

class Communicator :
    def __init__(self, AI) :
        self.ai = AI

    def sendText(self, text) :
        request = self.ai.text_request()
        request.lang = 'en'
        request.session_id = SESSION_ID
        request.query = text
        response = request.getresponse()
        print (response.read())

    def sendEvent(self, event) :
        request = self.ai.event_request(event)
        request.lang = 'en'  # optional, default value equal 'en'
        request.session_id = SESSION_ID
        response = request.getresponse()
        print(response.read())

def main():
    ai = apiai.ApiAI(CLIENT_ACCESS_TOKEN)
    com = Communicator(ai)
    com.sendText('Who are you?')
    event = apiai.events.Event("my_custom_event")
    com.sendEvent(event)

if __name__ == '__main__':
    main()

