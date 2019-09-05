'use strict';

/**
This home micro battery controller will manager charging and discharging of batteries.
It will do the following :
* turn on/off battery chargers
* turn on/off solar micro inverters (uInverters) which are connected to the batteries
* idle with everything off if nothing should be on

NOTE: Negative implies production, positive implies consumption.

The operation is based on a runlevel. A run level of 0 means everything is off.
A negative run level means we will be generating power using the uInverters.
A positive run level means we will be storing power to the batteries using chargers.

The system assesses logic based on power quantum.
The battery charger quantum of power is the amount of power consumed by each charger.
The uInveter quantum of power is the amoun tof power generated by each uInerter.
Run level changes (in a continuous manner) when the net power exceeds a quantum of power.
*/
class BatteryController {
  /** Set basic class variables
  */
  constructor(ip, hardwareController){
    this.ip=ip; // ip address on the LAN of the meter
    this.runLevel=0; // start in the idle runLevel

    this.bcW=100; // how much power does each battery charger consume
    this.uiW=-290; // how much power does each uInverter generate

    this.prodW=0; // how much power is our solar system generating
    this.consW=0; // how much power is our house consuming
    this.WMismatchThresh=50; // how many W can differ between a known consW-prodW and a meter reported net Watts (total Watts)

    this.Nui=-6; // Limit the total number of uInverters available
    this.Nbc=-this.Nui; // Limit the total number of battery chargers available (positive count)
    this.meter={}; // hold the meter data

    this.hardwareController=hardwareController;
  }

  /** Implement this method to get the house power data from your meter.
    Return a promise with the following structure {prodW, consW, netW}.
    let newW=null if your meter doesn't report the netW.
  */
  getData(){
    console.log('Inherit the BatteryController class and implement this virtual BatteryController::getData function')
    console.log('return a structure like so (power in Watts) : {prodW, consW, null}');
    console.log('OR return a structure like so (power in Watts) : {prodW, consW, netW}');
    return new Promise((resolve, reject) => {
      reject('you must overload this method in your own class');
    }).on("error", (err) => {
        console.log("Error: " + err.message);
        reject(err);
    });
  }

  /** Update the production and consumption data for the house
  @param data The json data describing the state of the house
  */
  processHouseStats(){
    return this.getData().then((stats) => {
      return this.updateState(stats.prodW, stats.consW, stats.netW);
    })
    .catch((err) => {
      console.log("Error: " + err.message);
      reject(err);
    });
  }

  /** Update the current state of the house
  @param prodW The Watts of power produced by microinverters on the system
  @param consW The Watts of power consumed by the house form the grid
  @param newW (optional) the reported net Watts consumed (should be close to netW=consW-prodW)
  */
  updateState(prodW, consW, netW){
    // console.log(prodW+'  '+consW+' '+netW)
    this.prodW=prodW;
    this.consW=consW;
    let totalCons=this.consW+this.prodW;
    if (netW!=null){
      this.netW=netW;
      let diff=this.netW-totalCons;
      if (Math.abs(diff>this.WMismatchThresh)){ // if we have an error in the reported and calculated total house consumption, then don't change anything
          console.log('calculated '+totalCons+' however the meter reported '+netW+' this is a large discrepancy of '+diff+' W > '+this.WMismatchThresh+' W, our difference threshold.');
          return; // do nothing
      }
    }
    // if (totalCons>0 && totalCons>-this.uiW && this.runLevel>this.Nui) // we can drop run level towards deepest discharging
    // Do we have any consumption ? Then move towards dischargning
    if (totalCons>0 && this.runLevel>this.Nui) // we can drop run level towards deepest discharging
      this.runLevel--;
    // Do we have production ? If we are producing more then the battery charger quantum then start charging
    if (totalCons<0 && totalCons<-this.bcW && this.runLevel<this.Nbc) // we can increase run level towards deepest charging
      this.runLevel++;
    this.hardwareController.setRunLevel(this.runLevel);
    this.logState();
  }

  logState(){
    let totalCons=this.consW+this.prodW;
    // console.log(this.meter.storage.type + ' N=' + this.meter.storage.activeCount + ' : ' + Math.round(this.meter.storage.wNow) + ' W');
    // console.log(this.meter.storage.state + ' : ' + Math.round(this.meter.storage.whNow) + ' Wh, full : ' + this.meter.storage.percentFull + '%');
    console.log('Date '+new Date().toISOString());
    if (this.meter.storage)
      console.log('Battery ('+this.meter.manufacturer+') '+this.meter.storage.state+' '+Math.round(this.meter.storage.wNow)+' W '+this.meter.storage.percentFull + '%');
    console.log('Meter '+Math.round(this.consW)+' + '+Math.round(this.prodW)+' = '+Math.round(totalCons)+' W : runLevel '+this.runLevel);
    this.hardwareController.dumpState();
  }

  reportProdCons(){
    return this.getHouseStats().then(() => {
      console.log(this.meter.inv.type + ' N=' + this.meter.inv.activeCount + ' : ' + Math.round(this.meter.inv.wNow)/1e3 + ' kW');
      console.log(this.meter.prod.type + ' ' + this.meter.prod.measurementType + ' : ' + Math.round(this.meter.prod.wNow)/1e3 + ' kW');

      console.log(this.meter.cons.type + ' ' + this.meter.cons.measurementType + ' : ' + Math.round(this.meter.cons.wNow)/1e3 + ' kW');
      console.log(this.meter.net.type + ' ' + this.meter.net.measurementType + ' : ' + Math.round(this.meter.net.wNow)/1e3 + ' kW');

      console.log('storage')
      console.log(this.meter.storage.type + ' N=' + this.meter.storage.activeCount + ' : ' + Math.round(this.meter.storage.wNow)/1e3 + ' kW');
      console.log(this.meter.storage.state + ' : ' + Math.round(this.meter.storage.whNow)/1e3 + ' kWh, full : ' + this.meter.storage.percentFull + '%');
      console.log('======== consumption =================')
      console.log(-Math.round(this.meter.prod.wNow)/1e3 + ' | ' + Math.round(this.meter.cons.wNow)/1e3 + ' | ' + Math.round(this.meter.net.wNow)/1e3 + ' kW')
      console.log()
    });
  }
}

module.exports = {
  BatteryController
}
