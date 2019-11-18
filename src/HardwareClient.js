/**
Copyright (c) 2019 The Battery Controller Authors. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are
 met:

    * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above
 copyright notice, this list of conditions and the following disclaimer
 in the documentation and/or other materials provided with the
 distribution.
    * Neither the name of Flatmax Pty. Ltd. nor the names of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
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
