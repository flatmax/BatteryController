#!/usr/bin/env node
/**
Copyright (c) 2019 The Battery Controller Authors. All rights reserved.

 This licence relates to source code for the Battery Controller outined below ("Source Code").


 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are
 met:

    * Redistributions of Source Code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above
 copyright notice, this list of conditions and the following disclaimer
 in the documentation and/or other materials provided with the
 distribution.
    * Neither the name of Flatmax Pty. Ltd. nor the names of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.

 THIS Source Code IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS Source Code, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
'use strict';
const http = require('http');
const BatteryControllerEnvoyMeter = require('./BatteryControllerEnvoyMeter').BatteryControllerEnvoyMeter

if (!module.parent){ // if we are run as a script, then run as the networked battery controller
  let HardwareController = require('./HardwareController').HardwareController;
  let hCont = new HardwareController;
  hCont.findAvailableServers();

  let envoyHost = 'envoy.local';
  let batteryController = new BatteryControllerEnvoyMeter(envoyHost, hCont);
  batteryController.setBaseLogFile('/root/batteryLog');
  let intID = setInterval(batteryController.processHouseStats.bind(batteryController), 10000);

  // // shutdown every hour
  // const util = require('util');
  // const setTimeoutPromise = util.promisify(setTimeout);
  //
  // let hourMS=60*60*1000;
  // setTimeoutPromise(hourMS, intID).then((intID) => {
  //   clearInterval(intID);
  // });

  // function turnOff(hardware){
  //   hardware.turnOffAll();
  // }
  //
  // process.on('SIGTERM', () => {
  //   console.log('sigterm')
  //   turnOff(hCont);
  // })
  // process.on('exit', (code) => {
  //   console.log('exit')
  //   turnOff(hCont);
  // });
}
