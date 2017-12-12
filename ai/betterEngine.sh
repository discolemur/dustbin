#!/bin/bash
say() { local IFS=+;/usr/bin/mplayer -ao alsa -really-quiet -noconsolecontrols "http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=$*&tl=en"; }

# Accept piped input
if [ -p /dev/stdin ]; then
    # If we want to read the input line by line
    # echo "Data was piped to this script!"
    while IFS= read line; do
        say ${line}
    done
else
    say $*
fi
