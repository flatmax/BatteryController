'use strict';

let Hardware = require('./Hardware').Hardware;

/** A networked hardware class.
This is the client which calls the HardwareServer which implements the switching of devices. It returns
the results using the JRPC protocol.
*/
class HardwareClient extends Hardware {
  /** Let the Hardware know we are running as a client
  */
  constructor(){
    super(null);
  }
}

module.exports = {
  HardwareClient
}

if (!module.parent){ // if we are run as a script, then test
  let port = 9001; // server port
  let host = "192.168.1.183";
  let hc = new HardwareClient;
  hc.connectToServer({host:host, port:port});

  let reqs = [hc.turnOffAllBC(),
              hc.turnOffAllUInv()];

  Promise.all(reqs).then((responses)=>{
    console.log(responses[0].result);
    console.log(responses[1].result);
  });

  reqs = [hc.getBCCnt(),
              hc.getUICnt()];

  Promise.all(reqs).then((responses)=>{
    console.log('nB '+responses[0].result);
    console.log('nU '+responses[1].result);
  });

  reqs = [hc.turnOnBC(1),
          hc.turnOnUI(2)];

  Promise.all(reqs).then((responses)=>{
    console.log('turn on bc 1 '+responses[0].result);
    console.log('turn on ui 2 '+responses[1].result);
  });

}
