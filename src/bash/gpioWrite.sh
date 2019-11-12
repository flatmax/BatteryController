#!/bin/sh
# DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
# . $DIR/gpioVars.sh
BASE_GPIO_PATH=/sys/class/gpio
echo $2 > $BASE_GPIO_PATH/gpio$1/value
