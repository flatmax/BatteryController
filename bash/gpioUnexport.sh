#!/bin/sh
# DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
# . $DIR/gpioVars.sh
BASE_GPIO_PATH=/sys/class/gpio
if [ -d $BASE_GPIO_PATH/gpio$1 ]; then
  echo "$1" > $BASE_GPIO_PATH/unexport
fi
