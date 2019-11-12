'use strict';

class HardwareController {
  constructor(){
    this.hardware = [];
  }

  /** Add hardware to the HardwareController
  */
  addHardware(hw){
    console.log(hw.constructor.name)
    if (hw.constructor.name != 'Hardware' && hw.constructor.name != 'HardwareClient')
      throw new Error(hw.constructor.name+' is not a Hardware instance');
    this.hardware.push(hw);
  }

  /** Given a run level, turn on either consume power (r>0) or generate power (r<0).
  Attempt to turn on all r chargers or inverters as required.
  The return value is r minus the number of battery chargers (consuming power) or
  uInverters (generating power) we have turned on. For example if we turned on two
  chargers, return r=r-2; If we turned on two uInverters, then return r=r+2;
  @param r The run level
  @return The new value for r
  */
  setRunLevel(r){
    let tasks = [];
    // first turn off what must be off
    if (r>=0) // we are charging, turn off all uInv
      this.hardware.forEach((hw) => {
        tasks.push(hw.turnOffAllUInv());
      });
    if (r<=0) // we are generating, turn off all chargers
      this.hardware.forEach((hw) => {
        tasks.push(hw.turnOffAllBC());
      });

    // no need to wait here as the GPIOs for positive run levels are not in the set of GPIOs for negative run levels

    if (r==0) // nothing to turn on, so return.
      return 0;

    let nBCPs=[], nUIPs=[];
    for (let h=0; h<this.hardware.length; h++) {
      nBCPs.push(this.hardware[h].getBCCnt());
      nUIPs.push(this.hardware[h].getUICnt());
    }

    return Promise.all(nBCPs).then((nBCsIn)=>{ // wait till we know how many BCs and UIs there are on all hardware types
      return Promise.all(nUIPs).then((nUIsIn)=>{ // wait till we know how many BCs and UIs there are on all hardware types
        let nBCs=[];
        nBCsIn.forEach((nbc)=>nBCs.push(nbc.result));
        let nUIs=[];
        nUIsIn.forEach((nui)=>nUIs.push(nui.result));
        console.log(nUIs)
        tasks=[];
        let tasksNoSum=[];
        // Turn on how every many devices are indicated - iterating through hardware
        for (let h=0; h<this.hardware.length && r!=0; h++) {
          let r0=r;
          let C=Math.max(nBCs[h], nUIs[h]);
          for (let c=0; c<C; c++){
            if (r==0)
              if (r0>0) // we are consuming, so turn off excess chargers
                tasksNoSum.push(this.hardware[h].turnOffBC(c));
              else // we are producing so turn off excess micro inverters
                tasksNoSum.push(this.hardware[h].turnOffUI(c));
            else {
              // console.log('enter h='+h+' c='+c+' r='+r)
              if (r>0) // we are consuming, so turn on chargers
                tasks.push(this.hardware[h].turnOnBC(c));
              else // we are generating, so turn on uInv
                tasks.push(this.hardware[h].turnOnUI(c)); // turnOnUI returns -1 on success, here r is increased
              // console.log('exit h='+h+' c='+c+' r='+r)
            }
          }

          return Promise.all(tasksNoSum).then(()=>{ // wait for tasks no sum to return
            // cumulative subtract for r ...
            return Promise.all(tasks).then((drp)=>{ // wait for summing tasks to return
              console.log(drp)
              drp.forEach((rp)=> {
                r-=rp.result;
              });
              console.log('returning r='+r)
              return r;
            });
          });
        };
      });
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
    this.hardware.forEach((hw) => {
      s+=hw.dumpState()+'\n';
    });
    return s;
  }

  /** Get the total number of battery chargers from all hardware
  @return The number of battery chargers
  */
  getBCCnt(){
    let N=0;
    this.hardware.forEach((hw) => {
      N+=hw.getBCCnt();
    });
    return N;
  }

  /** Get the total number of micro inverters from all hardware
  @return The number of micro inverters on the system
  */
  getUICnt(){
    let N=0;
    this.hardware.forEach((hw) => {
      N+=hw.getUICnt();
    });
    return N;
  }
}

module.exports = {
  HardwareController
}

if (!module.parent){ // if we are run as a script, then test
  let Hardware = require('./Hardware').Hardware;
  let hardware = new Hardware('Hardware.json');

  let hc = new HardwareController;
  hc.addHardware(hardware);
  // //hc.addHardware(new HardwareController);
  // console.log(hc)
  let r;
  // // r=hc.setRunLevel(1);
  // // hc.dumpState(1);
  // // r=hc.setRunLevel(-1);
  // // hc.dumpState(-1);
  // // r=hc.setRunLevel(-2);
  // // hc.dumpState(-2);
  // // r=hc.setRunLevel(-3);
  // // hc.dumpState(-3);
  // // r=hc.setRunLevel(-5);
  // // hc.dumpState(-5);
  // // r=hc.setRunLevel(1);
  // // hc.dumpState(1);
  // // r=hc.setRunLevel(2);
  // // hc.dumpState(2);
  // // r=hc.setRunLevel(3);
  // // hc.dumpState(3);
  // // r=hc.setRunLevel(5);
  // // hc.dumpState(5);
  // r=hc.setRunLevel(-1);
  // console.log(hc.dumpState(-1));
  // r=hc.setRunLevel(-2);
  // console.log(hc.dumpState(-2));
 hc.setRunLevel(-3);
  // console.log(hc.dumpState(-3));
  // r=hc.setRunLevel(0);
  // console.log(hc.dumpState(0));
}
