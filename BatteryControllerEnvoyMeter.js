#!/usr/bin/env node
'use strict';
const http = require('http');
const BatteryController = require('./BatteryController').BatteryController

let ip='192.168.1.60'

/**
Understand the BatteryController class first, then implement this class
*/
class BatteryControllerEnvoyMeter extends BatteryController {
  /** Get the real time data from the Enphase Envoy.
  Return (power in Watts) : {prodW, consW, netW}
  */
  getData(){
    return new Promise((resolve, reject) => {
      http.get('http://'+ip+'/production.json', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          let meter=JSON.parse(data);
          // console.log(data)
          this.meter.manufacturer = 'Enphase';
          this.meter.inv = meter.production[0];
          this.meter.prod = meter.production[1];
          this.meter.cons = meter.consumption[0];
          this.meter.net = meter.consumption[1];
          this.meter.storage = meter.storage[0];

          resolve({
            prodW:-this.meter.prod.wNow,
            consW:this.meter.cons.wNow,
            netW:this.meter.net.wNow
          });
        });

      }).on("error", (err) => {
        console.log("Error: " + err.message);
        reject(err);
      });
    });
  }
}

if (!module.parent){ // if we are run as a script, then test
  let Hardware = require('./Hardware').Hardware;
  let hardware = new Hardware('Hardware.json');

  let HardwareController = require('./HardwareController').HardwareController;
  let hc = new HardwareController;
  hc.addHardware(hardware);

  let batteryController = new BatteryControllerEnvoyMeter(ip, hc);
  batteryController.setLogFile('/root/batteryLog.txt');
  setInterval(batteryController.processHouseStats.bind(batteryController), 4000);

  function turnOff(hardware){
    hardware.turnOffAll();
  }

  // process.on('SIGKILL', () => {
  //   console.log('sigkill')
  //   turnOff(hardware);
  // })
  process.on('SIGTERM', () => {
    console.log('sigterm')
    turnOff(hardware);
  })
  process.on('exit', (code) => {
    console.log('exit')
    turnOff(hardware);
  });

  // test exit
  // setTimeout(() => {
  //       // process.exit(0);
  //       throw new Error('throw exit');
  //     }, 6000).unref();
}
