'use strict';

class HardwareController {
  constructor(){
    this.hardware = [];
  }

  /** Add hardware to the HardwareController
  */
  addHardware(hw){
    if (hw.constructor.name != 'Hardware')
      throw new Error(hw.constructor.name+' is not a Hardware instance');
    this.hardware.push(hw);
  }

  /** Given a run level, turn on either consume power (r>0) or generate power (r<0).
  Attempt to turn on all r chargers or inverters as required.
  The return value is r minus the number of battery chargers (consuming power) or
  uInverters (generating power) we have turned on. For example if we turned on two
  chargers, return r=r-2; If we turned on two uInverters, then return r=r+2;
  @param r The run level
  @return The new value for r.
  */
  setRunLevel(r){
    // first turn off what must be off
    if (r>=0) // we are charging, turn off all uInv
      this.hardware.forEach((hw) => {
        hw.turnOffAllUInv();
      });
    if (r<=0) // we are generating, turn off all chargers
      this.hardware.forEach((hw) => {
        hw.turnOffAllBC();
      });

    if (r==0) // nothing to turn on, so return.
      return 0;

    // Turn on how every many devices are indicated - iterating through hardware
    for (let h=0; h<this.hardware.length && r!=0; h++) {
      let rO=r;
      for (let c=0; c<Math.abs(rO); c++){
        // console.log('enter h='+h+' c='+c+' r='+r)
        if (r>0) // we are consuming, so turn on chargers
          r-=this.hardware[h].turnOnBC(c);
        else // we are generating, so turn on uInv
          r-=this.hardware[h].turnOnUI(c); // turnOnUI returns -1 on success, here r is increased
        // console.log('exit h='+h+' c='+c+' r='+r)
        if (r==0)
          break;
      }
    }
    return r;
  }

  dumpState(){
    let s='';
    this.hardware.forEach((hw) => {
      s+=hw.dumpState()+'\n';
    });
    console.log(s)
  }
}

if (!module.parent){ // if we are run as a script, then test
  let Hardware = require('./Hardware').Hardware;
  let hardware = new Hardware('Hardware.json');

  let hc = new HardwareController;
  hc.addHardware(hardware);
  //hc.addHardware(new HardwareController);
  console.log(hc)
  let r=hc.setRunLevel(1);
  console.log('r='+r);
  r=hc.setRunLevel(-2);
  console.log('r='+r);
  r=hc.setRunLevel(-5);
  console.log('r='+r);
  r=hc.setRunLevel(5);
  console.log('r='+r);
  hc.dumpState();
}
