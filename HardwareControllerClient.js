'use strict';

let JRPC = require('./JRPC').JRPC;

/** A networked class to controll hardware.
This is the client which calls a server to do the actual switching of BCs and UIs.
Using the JRPC protocol
*/
class HardwareControllerServer extends JRPC {
  constructor(){
    super();
  }
}

if (!module.parent){ // if we are run as a script, then test
  let port = 9001; // server port

  let Hardware = require('./Hardware').Hardware;
  let hardware = new Hardware('Hardware.json');

  let hc = new HardwareControllerServer;
  hc.addHardware(hardware);
  hc.startServer(port);
  // //hc.addHardware(new HardwareController);
  // console.log(hc)
//  hc.setRunLevel(3);
}
