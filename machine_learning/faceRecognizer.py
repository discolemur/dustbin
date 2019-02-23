#! /usr/bin/env python3

# TODO
#config = READJSON(`${__dirname}/../config.json`)

# pip install paho-mqtt

"""
A small example subscriber
"""
import paho.mqtt.client as paho
import time
import json

def send_ping(client) :
  print("Sending ping...")
  ping_msg = json.dumps({'answer':"Nick"})
  client.publish("/ping", payload=ping_msg)

def on_message(client, userdata, msg) :
  content = json.loads(msg.payload)
  if content['request'] == 'ping' :
    print('Resending ping.')
    send_ping(client)
  if content['request'] == 'die' :
    print('Dying upon request.')
    exit(0)

def on_connect() :
  print('Connected!')

if __name__ == '__main__':
  print('Making client...')
  client = paho.Client()
  client.on_message = on_message
  client.on_connect = on_connect
  print('Trying to connect...')
  client.connect(config['mqtt_host'], config['mqtt_port'], 60)
  print('Trying to subscribe...')
  client.subscribe("/vision", 0)
  while client.loop() == 0:
    send_ping(client)
    time.sleep(5)
    pass

