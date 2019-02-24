#! /usr/bin/env python

# pip install paho-mqtt

#const KNOWN_PEOPLE_FILE = `${__dirname}/models/faces.json`;
#const KNOWN_PEOPLE = require(KNOWN_PEOPLE_FILE);
#const KNOWN_OBJECTS_FILE = `${__dirname}/models/faces.json`;
#const KNOWN_OBJECTS = require(KNOWN_OBJECTS_FILE);

"""
A small example subscriber
"""
import paho.mqtt.client as paho
import time
import json

json_data=open('../config.json').read()
config = json.loads(json_data)

def send_person_response(client) :
  ping_msg = json.dumps({'success': True, 'answer':'Nick', 'what': 'person'})
  print("Sending response: %s" %ping_msg)
  client.publish(config['mqtt_vision_response'], payload=ping_msg)

def send_object_response(client) :
  ping_msg = json.dumps({'success': True, 'answer':"table", 'what': 'object'})
  print("Sending response: %s" %ping_msg)
  client.publish(config['mqtt_vision_response'], payload=ping_msg)

def on_message(client, userdata, msg) :
  content = json.loads(msg.payload)
  print(content)
  if content['request'] == 'identify' :
    if content['what'] == 'person' :
      send_person_response(client)
    if content['what'] == 'object' :
      send_object_response(client)
  if content['request'] == 'die' :
    print('Dying upon request.')
    exit(0)

def on_connect(client, obj, flags, rc) :
  print('Connected!')

if __name__ == '__main__':
  print('Making client...')
  client = paho.Client()
  client.on_message = on_message
  client.on_connect = on_connect
  print('Trying to connect to %s:%d...' %(config['mqtt_host'], config['mqtt_port']))
  client.connect(config['mqtt_host'], config['mqtt_port'], 60)
  print('Trying to subscribe to %s...' %config['mqtt_vision_request'])
  client.subscribe(config['mqtt_vision_request'], 0)
  client.loop_forever()

