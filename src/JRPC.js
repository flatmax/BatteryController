"use strict";

const jayson = require('jayson/promise');

/** JRPC protocol for getting hardware talking to a hardware controller over the network
*/
class JRPC {
  /** Constructor sets the default port
  */
  constructor(){
      this.port=9100;
  }

  /** Connect to a server
  @param params host and port if required for example params = {host : "127.0.0.1", port: 9100}
  */
  connectToServer(params){
    let cp={};
    if (params){
      if (params.port)
        this.port = params.port;
      if (params.host)
        cp.host=params.host;
    }
    cp.port=this.port;
    this.client = jayson.client.http(cp);
  }

  /** Create a jayson server and add the methods
  */
  startServer(port){
    // currently unencrypted, but can make encrypted if we generate certs.
    if(port != null)
      this.port=port;
    this.server=jayson.server({
      turnOffAllUInv: (args)=>{
        return new Promise((resolve, reject) => {
          this.turnOffAllUInv();
          resolve();
        });
      },
      turnOffAllBC: (args)=>{
        return new Promise((resolve, reject) => {
          this.turnOffAllBC();
          resolve();
        });
      },
      getBCCnt: (args)=>{
        return new Promise((resolve, reject) => {
          resolve(this.getBCCnt());
        });
      },
      getUICnt: (args)=>{
        return new Promise((resolve, reject) => {
          resolve(this.getUICnt());
        });
      },
      turnOnBC: (args)=>{
        return new Promise((resolve, reject) => {
          resolve(this.turnOnBC(args[0]));
        });
      },
      turnOffBC: (args)=>{
        return new Promise((resolve, reject) => {
          resolve(this.turnOffBC(args[0]));
        });
      },
      turnOnUI: (args)=>{
        return new Promise((resolve, reject) => {
          resolve(this.turnOnUI(args[0]));
        });
      },
      turnOffUI: (args)=>{
        return new Promise((resolve, reject) => {
          resolve(this.turnOffUI(args[0]));
        });
      },
      dumpState: (args)=>{
        return new Promise((resolve, reject) => {
          let s=this.dumpState();
          console.log(new Date()+'\n'+s);
          resolve(s);
        });
      }
    });

    this.server.http().listen(this.port, ()=>{
      console.log('JRPC::startServer : listening on port '+this.port);
    });
  }

  /// turn off all micro inverters
  turnOffAllUInv(){
    if (!this.client & !this.server)
      throw(new Error('no client or server present - oops'));
    if (this.client)
      return this.client.request('turnOffAllUInv', []);
    else // server
      console.log("JRPC::turnOffAllUInv : not overloaded, returning 0");
    return 0;
  }

  /// turn off all battery chargers
  turnOffAllBC(){
    if (!this.client & !this.server)
      throw(new Error('no client or server present - oops'));
    if (this.client)
      return this.client.request('turnOffAllBC', []);
    else // server
      console.log("JRPC::turnOffAllBC : not overloaded, returning 0");
    return 0;
  }

  /** Get the total number of battery chargers from all hardware
  @return The number of battery chargers
  */
  getBCCnt(){
    if (!this.client & !this.server)
      throw(new Error('no client or server present - oops'));
    if (this.client)
      return this.client.request('getBCCnt', []);
    else // server
      console.log("JRPC::getBCCnt : not overloaded, returning -1");
    return -1;
  }

  /** Get the total number of micro inverters from all hardware
  @return The number of micro inverters on the system
  */
  getUICnt(){
    if (!this.client & !this.server)
      throw(new Error('no client or server present - oops'));
    if (this.client)
      return this.client.request('getUICnt', []);
    else // server
      console.log("JRPC::getUICnt : not overloaded, returning -1");
    return -1;
  }

  /** turn on a battery charger
  @param which index (starting from 0) of which charger to turn on
  @return 0 if not turned on, 1 on success
  */
  turnOnBC(which){
    console.log('JRPC::turnOnBC : '+which);
    if (!this.client & !this.server)
      throw(new Error('no client or server present - oops'));
    if (this.client)
      return this.client.request('turnOnBC', [which]);
    else // server
      console.log("JRPC::turnOnBC : not overloaded, returning 0");
    return 0;
  }

  /** turn off a battery charger
  @param which index (starting from 0) of which charger to turn off
  @return 0 if not turned on, 1 on success
  */
  turnOffBC(which){
    console.log('JRPC::turnOffBC : '+which);
    if (!this.client & !this.server)
      throw(new Error('no client or server present - oops'));
    if (this.client)
      return this.client.request('turnOffBC', [which]);
    else // server
      console.log("JRPC::turnOffBC : not overloaded, returning 0");
    return 0;
  }

  /** turn on a uInv
  @param which index (starting from 0) of which inverter to turn on
  @return 0 if not turned on, -1 on success
  */
  turnOnUI(which){
    console.log('JRPC::turnOnUI : '+which);
    if (!this.client & !this.server)
      throw(new Error('no client or server present - oops'));
    if (this.client)
      return this.client.request('turnOnUI', [which]);
    else // server
      console.log("JRPC::turnOnUI : not overloaded, returning 0");
    return 0;
  }

  /** turn off a uInv
  @param which index (starting from 0) of which inverter to turn off
  @return 0 if not turned on, -1 on success
  */
  turnOffUI(which){
    console.log('JRPC::turnOffUI : '+which);
    if (!this.client & !this.server)
      throw(new Error('no client or server present - oops'));
    if (this.client)
      return this.client.request('turnOffUI', [which]);
    else // server
      console.log("JRPC::turnOffUI : not overloaded, returning 0");
    return 0;
  }

  /** write out the current state to a string
  @return a string defining the hardware state
  */
  dumpState(){
    if (!this.client & !this.server)
      throw(new Error('no client or server present - oops'));
    if (this.client)
      return this.client.request('dumpState', []);
    else // server
      console.log("JRPC::dumpState : not overloaded, returning ''");
    return '';
  }
}

module.exports = {
  JRPC
}

// test
if (!module.parent){ // if we are run as a script, then test
  let jrpc = new JRPC;
  jrpc.startServer();
}
