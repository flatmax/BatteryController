#!/usr/bin/env node
'use strict';

let Hardware = require('./Hardware').Hardware;

/** A networked hardware class.
This is the server which implements the switching of BCs and UIs. It returns
the results using the JRPC protocol.
*/
class HardwareServer extends Hardware {
}

if (!module.parent){ // if we are run as a script, then test
  let port = 9001; // server port

  let hs = new HardwareServer('Hardware.json');
  hs.startServer(port);
  // //hc.addHardware(new HardwareController);
  // console.log(hc)
}
