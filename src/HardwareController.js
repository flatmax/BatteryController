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

const MDNS = require('./MDNS').MDNS;
const HardwareClient = require('./HardwareClient').HardwareClient;

class HardwareController extends MDNS {
  /** Construct the hardwareController
  */
  constructor(){
    super();
    this.hardware = [];
  }

  connectToServer(params){
    console.log(params);
    let hCli = new HardwareClient;
    hCli.connectToServer(params);
    this.addHardware(hCli);
  }

  /** Add hardware to the HardwareController
  */
  addHardware(hw){
    console.log('Adding '+hw.constructor.name)
    if (hw.constructor.name != 'Hardware' && hw.constructor.name != 'HardwareClient')
      throw new Error(hw.constructor.name+' is not a Hardware instance');
    if (this.hardware.length==0 || this.hardware.find(el=>{return el.name === hw.name})==null){
      this.hardware.push(hw);
      this.hardware.sort((a, b) => {
        var nameA = a.name.toUpperCase(); // ignore case
        var nameB = b.name.toUpperCase(); // ignore case
        if (nameA < nameB)
          return -1;
        if (nameA > nameB)
          return 1;
        return 0;  // names must be equal
      });
    }
  }

  /** Drop a hardware server from the hardware list
  @param add The server's network address
  */
  removeHardware(add){
    console.log('HardwareController::removeHardware '+add)
    let index=-1;
    for (let i=0; i<this.hardware.length; i++)
      if  (this.hardware[i].client.options.host === add)
        index=i;
    if (index>=0)
      this.hardware.splice(index,1);
  }


  /** Method to find available hardware servers and populate a full list
  */
  refreshHardwareList(){
    this.hardware=[];
    this.findAvailableServers();
  }

  /** Given a run level, turn on either consume power (r>0) or generate power (r<0).
  Attempt to turn on all r chargers or inverters as required.
  The return value is r minus the number of battery chargers (consuming power) or
  uInverters (generating power) we have turned on. For example if we turned on two
  chargers, return r=r-2; If we turned on two uInverters, then return r=r+2;
  @param r The run level
  @return The new value for r
  */
  async setRunLevel(r){
    let shutdownPs = [];
    // first turn off what must be off
    if (r>=0) // we are charging, turn off all uInv
      this.hardware.forEach((hw) => {
        shutdownPs.push(hw.turnOffAllUInv());
      });
    if (r<=0) // we are generating, turn off all chargers
      this.hardware.forEach((hw) => {
        shutdownPs.push(hw.turnOffAllBC());
      });

    // no need to wait here as the GPIOs for positive run levels are not in the set of GPIOs for negative run levels

    if (r==0) // nothing to turn on, so return.
      return 0;

    // find how many devices each battery has of each type - this allows batteries to change with time for whatever reason
    let nBCPs=[], nUIPs=[];
    for (let h=0; h<this.hardware.length; h++) {
      nBCPs.push(this.hardware[h].getBCCnt());
      nUIPs.push(this.hardware[h].getUICnt());
    }

    // For each of the returned promises, find their results
    // then step through devices until we either run out of devices or runlevel = 0
    return Promise.all([nBCPs, nUIPs, shutdownPs].map(Promise.all.bind(Promise)))
    .then(async prmss => {
      let nBCsIn=prmss[0]; // battery charger counts per hardware (as a resolved promise)
      let nUIsIn=prmss[1]; // micro inverter counts per hardware (as a resolved promise)
      let nBCs=[];
      nBCsIn.forEach((nbc)=>nBCs.push(nbc.result));
      let nUIs=[];
      nUIsIn.forEach((nui)=>nUIs.push(nui.result));

      // work out the absolute maximum number of BCs or UIs
      let C=0;
      for (let h=0; h<this.hardware.length; h++)
        if (Math.max(nBCs[h], nUIs[h])>C)
          C=Math.max(nBCs[h], nUIs[h]);

      // Turn on how ever many devices are indicated - iterating through hardware
      // Turn on battery chargers if the runlevel is > 0
      // Make sure we turn on chargers for one hardware at a time - rather then part of a hardware each time
      if (r>0) {
        for (let h=0; h<this.hardware.length; h++)
          for (let c=0; c<C; c++)
            if (r==0){ // turn everything else off
                await this.hardware[h].turnOffBC(c);
                await this.hardware[h].turnOffUI(c);
            } else {
              let res = await this.hardware[h].turnOnBC(c);
              r-=res.result;
            }
      } else { // r<0 we are producing, so turn on micro inverters
        let h=0;
        for (let c=0; c<C; c++)
          for (let h=0; h<this.hardware.length; h++)
            if (r==0){ // turn everything else off
                await this.hardware[h].turnOffBC(c);
                await this.hardware[h].turnOffUI(c);
            } else {
              let res = await this.hardware[h].turnOnUI(c); // turnOnUI returns -1 on success, here r is increased
              r-=res.result;
            }
      }
      return r;
    });
  }

  /** dump the system state
  @param r (optional) The current run level to print
  @return A string describing the current state of each hardware attached to the system
  */
  dumpState(r){
    let s='';
    if (r)
      s+='r='+r+' ';
    let states=[]; // collect states asynchronously for speed
    this.hardware.forEach((hw) => {
      states.push(hw.dumpState());
    });
    return Promise.all(states)
    .then(sr => { // concat states for each battery
      sr.forEach(srs=>{
        s+=srs.result+'\n';
      });
      return s;
    })
  }

  /** Get the total number of battery chargers from all hardware
  @return The number of battery chargers
  */
  async getBCCnt(){
    let N=0;
    await Promise.all(this.hardware.map(async (hw) => {
      let res = await hw.getBCCnt();
      N+= res.result;
    }));
    return N;
  }

  /** Get the total number of micro inverters from all hardware
  @return The number of micro inverters on the system
  */
  async getUICnt(){
    let N=0;
    await Promise.all(this.hardware.map(async (hw) => {
      let res = await hw.getUICnt();
      N+=res.result;
    }));
    return N;
  }
}

module.exports = {
  HardwareController
}

if (!module.parent){ // if we are run as a script, then test
  let hCont = new HardwareController;
  hCont.findAvailableServers();

  let intID = setInterval(hCont.refreshHardwareList.bind(hCont), 10000);
}
