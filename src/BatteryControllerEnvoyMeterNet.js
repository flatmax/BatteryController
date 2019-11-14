#!/usr/bin/env node
'use strict';
const http = require('http');
const BatteryControllerEnvoyMeter = require('./BatteryControllerEnvoyMeter').BatteryControllerEnvoyMeter

if (!module.parent){ // if we are run as a script, then run as the networked battery controller
  let HardwareController = require('./HardwareController').HardwareController;
  let hCont = new HardwareController;
  hCont.findAvailableServers();

  // let envoyIP = '192.168.1.60';
  let envoyHost = 'envoy.local';
  let batteryController = new BatteryControllerEnvoyMeter(envoyHost, hCont);
  batteryController.setBaseLogFile('/root/batteryLog');
  setInterval(batteryController.processHouseStats.bind(batteryController), 10000);

  function turnOff(hardware){
    hardware.turnOffAll();
  }

  process.on('SIGTERM', () => {
    console.log('sigterm')
    turnOff(hardware);
  })
  process.on('exit', (code) => {
    console.log('exit')
    turnOff(hardware);
  });
}
