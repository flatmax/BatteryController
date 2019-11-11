'use strict';

let HardwareController = require('./HardwareController').HardwareController;

/** A networked class to controll hardware.
This is the server which implements the switching of BCs and UIs. It returns
the results using the JRPC protocol.
*/
class HardwareControllerServer extends HardwareController {
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
