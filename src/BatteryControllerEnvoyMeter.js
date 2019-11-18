/**
Copyright (c) 2019 The Battery Controller Authors. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are
 met:

    * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above
 copyright notice, this list of conditions and the following disclaimer
 in the documentation and/or other materials provided with the
 distribution.
    * Neither the name of Flatmax Pty. Ltd. nor the names of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
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

module.exports = {
  BatteryControllerEnvoyMeter
}

if (!module.parent){ // if we are run as a script, then test - this was used when batteries weren't networked - however hasn't been tested with non-networked hardware since updating to networked batteries.
  let Hardware = require('./Hardware').Hardware;
  let hardware = new Hardware('Hardware.json');

  let HardwareController = require('./HardwareController').HardwareController;
  let hc = new HardwareController;
  hc.addHardware(hardware);

  let batteryController = new BatteryControllerEnvoyMeter(ip, hc);
  batteryController.setBaseLogFile('/root/batteryLog');
  setInterval(batteryController.processHouseStats.bind(batteryController), 10000);

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
