#! /usr/bin/env python

from ai.Communicator import Communicator
from robot.move import Move

def main() :
    com = Communicator()
    move = Move()
    response = com.detect_intent_texts('hi')
    move.move(response.query_result.action)

if __name__ == '__main__':
    main()