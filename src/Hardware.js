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
const fs = require('fs');
const GPIO = require('./GPIO').GPIO;

let JRPC = require('./JRPC').JRPC;

/** Controlls GPIO ports for turning devices (relays) on and off
inherits the JRPC class for comms over a network if necessary
*/
class Hardware extends JRPC {
  constructor(jsonDefinition){
    super();
    this.watchdogSleepTime=120000; // ms watchdog sleep timer
    if (jsonDefinition == null){
      console.log('Hardware::constructor : running as a network client');
      return;
    }
    if (!fs.existsSync(jsonDefinition))
      throw new ReferenceError('The file '+jsonDefinition+' doesn\'t exist.');

    // merge the json data into the class member variables
    let rawData = fs.readFileSync(jsonDefinition);
    Object.assign(this, JSON.parse(rawData));

    this.gpio = new GPIO;

    // set to an idle state
    this.turnOffAll();
  }

  /** Turns off every device
  */
  turnOffAll(){
    this.turnOffAllUInv();
    this.turnOffAllBC();
  }

  /// turn off all micro inverters
  turnOffAllUInv(){
    if (this.client)
      return super.turnOffAllUInv();
    this.uiGPIOs.forEach((gpio) => {
      this.setGPIO(gpio, 0);
    });
  }

  /// turn off all battery chargers
  turnOffAllBC(){
    if (this.client)
      return super.turnOffAllBC();
    this.bcGPIOs.forEach((gpio) => {
      this.setGPIO(gpio, 0);
    });
  }

  /** Get the number of battery chargers
  @return The number of BCs we have
  */
  getBCCnt(){
    if (this.client)
      return super.getBCCnt();
    return this.bcGPIOs.length;
  }

  /** Get the number of uInverters
  @return The number of UIs we have
  */
  getUICnt(){
    if (this.client)
      return super.getUICnt();
    return this.uiGPIOs.length;
  }

  /** turn on a battery charger
  @param which index (starting from 0) of which charger to turn on
  @return 0 if not turned on, 1 on success
  */
  turnOnBC(which){
    if (this.client)
      return super.turnOnBC(which);
    if (which<0 || which>=this.bcGPIOs.length) // if which is negative or larger then the number we have
      return 0;
    return this.setGPIO(this.bcGPIOs[which], 1);
  }

  /** turn off a battery charger
  @param which index (starting from 0) of which charger to turn off
  @return 0 if not turned on, 1 on success
  */
  turnOffBC(which){
    if (this.client)
      return super.turnOffBC(which);
    if (which<0 || which>=this.bcGPIOs.length) // if which is negative or larger then the number we have
      return 0;
    return this.setGPIO(this.bcGPIOs[which], 0);
  }

  /** turn on a uInv
  @param which index (starting from 0) of which inverter to turn on
  @return 0 if not turned on, -1 on success
  */
  turnOnUI(which){
    if (this.client)
      return super.turnOnUI(which);
    if (which<0 || which>=this.uiGPIOs.length) // if which is negative or larger then the number we have
      return 0;
    return -this.setGPIO(this.uiGPIOs[which], 1);
  }

  /** turn off a uInv
  @param which index (starting from 0) of which inverter to turn off
  @return 0 if not turned on, -1 on success
  */
  turnOffUI(which){
    if (this.client)
      return super.turnOffUI(which);
    if (which<0 || which>=this.uiGPIOs.length) // if which is negative or larger then the number we have
      return 0;
    return -this.setGPIO(this.uiGPIOs[which], 0);
  }

  /** Called when the system has been inactive for more then watchdogSleepTime
  Turns all GPIOs off as a safety mechanism
  */
  watchdogTimeout(){
      console.log('Hardware::watchdogTimeout : '+ new Date() +' turning all GPIOs off');
      this.removeWatchdog();
      this.turnOffAll();
  }

  /** If a watchdog is active, then remove it
  */
  removeWatchdog(){
    if (this.watchdogID){ // clear the watchdog timer
      let wid = this.watchdogID;
      this.watchdogID=null;
      clearInterval(wid);
    }
  }

  /** Set a GPIO line
  @param which GPIO
  @param the new value
  @return 0 on failure 1 on success
  */
  setGPIO(which, val){
    // set a watchdog timerout to turn everything off if the system isn't active
    this.removeWatchdog();
    this.watchdogID=setInterval(this.watchdogTimeout.bind(this), this.watchdogSleepTime);

    try {
      this.gpio.write(which, val);
    } catch (err) {
      console.log(err);
      return 0;
    }
    return 1;
  }

  /** Get the state of a gpio
  @return The current value (0|1) of the pin
  */
  getGPIOState(which){
    return this.gpio.read(which);
  }

  /** write out the current state to a string
  @return a string defining the hardware state
  */
  dumpState(){
    if (this.client) // the client returns whatever the network returns
      return super.dumpState();
    let s='uBattery '+this.name;
    s+=' bc = [';
    this.bcGPIOs.forEach((gpio) => {s+=' '+this.getGPIOState(gpio)});
    s+=' ] ui = [';
    this.uiGPIOs.forEach((gpio) => {s+=' '+this.getGPIOState(gpio)});
    s+=' ]'
    return s;
  }

  /** Get the name of this hardware
  @return The name
  */
  getName(){
    if (this.client) // the client returns whatever the network returns
      return super.getName();
    return this.name;
  }
}

module.exports = {
  Hardware
}

if (!module.parent){ // if we are run as a script, then test
  // test
  let hardware = new Hardware('Hardware.json');
  console.log(hardware)

  hardware.turnOffAllUInv();
  hardware.turnOffAllBC();
  let state = hardware.dumpState();
  console.log(state)
}
