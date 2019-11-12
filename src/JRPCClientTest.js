"use strict";

const JRPC = require('./JRPC').JRPC;

const jrpc = new JRPC;
const host = "192.168.1.183"
jrpc.connectToServer({host:host, port:9001});
let reqs = [jrpc.getBCCnt(),
            jrpc.getUICnt()];

Promise.all(reqs).then((responses)=>{
  console.log('nB '+responses[0].result);
  console.log('nU '+responses[1].result);
});

reqs = [jrpc.turnOnBC(1),
            jrpc.turnOnUI(2)];

Promise.all(reqs).then((responses)=>{
  console.log('nB '+responses[0].result);
  console.log('nU '+responses[1].result);
});
