#!/usr/bin/env node
'use strict';
const http = require('http');
const BatteryControllerEnvoyMeter = require('./BatteryControllerEnvoyMeter').BatteryControllerEnvoyMeter

if (!module.parent){ // if we are run as a script, then test
  let HardwareClient = require('./HardwareClient').HardwareClient;
  let port = 9001; // server port
  let host = "192.168.1.183";
  let hCli = new HardwareClient;
  hCli.connectToServer({host:host, port:port});

  let HardwareController = require('./HardwareController').HardwareController;
  let hCont = new HardwareController;
  hCont.addHardware(hCli);

  hCont.setRunLevel(-4).then((r)=>{
    console.log('runLevel = '+r);
    return hCont.dumpState();
  }).then(s=>{
    console.log(s)
  });
  // let batteryController = new BatteryControllerEnvoyMeter(ip, hc);
  // batteryController.setBaseLogFile('/root/batteryLog');
  // setInterval(batteryController.processHouseStats.bind(batteryController), 10000);
  //
  // function turnOff(hardware){
  //   hardware.turnOffAll();
  // }
  //
  // // process.on('SIGKILL', () => {
  // //   console.log('sigkill')
  // //   turnOff(hardware);
  // // })
  // process.on('SIGTERM', () => {
  //   console.log('sigterm')
  //   turnOff(hardware);
  // })
  // process.on('exit', (code) => {
  //   console.log('exit')
  //   turnOff(hardware);
  // });
  //
  // // test exit
  // // setTimeout(() => {
  // //       // process.exit(0);
  // //       throw new Error('throw exit');
  // //     }, 6000).unref();
}
