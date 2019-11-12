#!/usr/bin/env node
'use strict';

const GPIO = require('../GPIO').GPIO;

let gpio = new GPIO;
gpio.write(26, 1);
let res=gpio.read(26);
console.log(res)
gpio.write(26, 0);
res=gpio.read(26);
console.log(res)
gpio.write(26, 1);
res=gpio.read(26);
console.log(res)
// // const pigpio = require('/usr/lib/node_modules/pigpio');
// // const GPIO = pigpio.Gpio;
// // pigpio.configureSocketPort(8889);
// // const out26 = new GPIO(26, {mode: GPIO.OUTPUT});
// // // // led.digitalWrite(1);
// let spawnSync = require('child_process').spawnSync;
// var r = spawnSync('../gpioReserveOut.sh', ['26']);
// if (r.stderr.length)
//   throw new Error(r.stderr);
// else
//   if (r.stdout.length)
//     console.log(r.stdout.toString());
//
//
// r = spawnSync('../gpioWrite.sh', ['26', '1']);
// if (r.stderr.length)
//   throw new Error(r.stderr);
// else
//   if (r.stdout.length)
//     console.log(r.stdout.toString());
//
// r = spawnSync('../gpioRead.sh', ['26']);
// if (r.stderr.length)
//   throw new Error(r.stderr);
// else
//   if (r.stdout.length)
//     console.log(r.stdout.toString());
