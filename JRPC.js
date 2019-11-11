"use strict";

let WebSocketServer = require('ws').Server;
let Remote = require('jrpc');
let assert = require('assert')

let fs = require('fs');
let https = require('https'); // require modules for secure socket connection

class JRPC {
  startServer(port){
    // currently unencrypted, but can make encrypted if we generate certs.
    if(port == null)
      this.wss = new WebSocketServer({port: 9100}); // create the websocket
    else
      this.wss = new WebSocketServer({port: port}); // create the websocket

    assert(this.wss.parent == null, 'wss.parent already exists, this needs upgrade.')
    this.wss.on('connection', this.setupRemote, this);
    this.wss.parent=this;
  }

  /** Function called by the WebSocketServer once 'connection' is fired
  \param ws The web socket created by the web socket server
  */
  setupRemote(ws){
    let parent = this.parent;
    let remote = new Remote({remoteTimeout: this.parent.remoteTimeout});
    if (parent.remote==null)
      parent.remote = [remote];
    else
      parent.remote.push(remote);

    parent.classes.forEach(function(c){
      remote.expose(c);
      remote.upgrade();
    });

    // Each new connection gets a unique handler
    ws.on('message', function(msg) {
      // console.log("Message : "+msg);
      remote.receive(msg);
    });

    // Let JRPC send requests and responses continuously
    remote.setTransmitter(function(msg, next) {
      // console.log("Starting connection : "+msg);
      try {
        ws.send(msg);
        return next(false);
      } catch (e) {
        console.log(e)
        return next(true);
      }
    });
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
    if (r==null)
      throw(new Error("JRPC::setRunLevel r==null, this shouldn't happen"));
    if (this.wss) // if we have a functioning websocket
      return next(null,r);
    return r;
  }

  /** dump the system state
  @param r (optional) The current run level to print
  @return A string describing the current state of each hardware attached to the system
  */
  dumpState(r, s){
    if (s==null)
      throw('JRPC::dumpState s==null, this shouldn\'t happen');
    if (this.wss) // if we have a functioning websocket
      return next(null,s);
    return s;
  }

  /** Get the total number of battery chargers from all hardware
  @param n (unused) The BC cnt
  @return The number of battery chargers
  */
  getBCCnt(n){
    if (n==null)
      throw('JRPC::getBCCnt n==null, this shouldn\'t happen');
    if (this.wss) // if we have a functioning websocket
      return next(null,n);
    return n;
  }

  /** Get the total number of micro inverters from all hardware
  @param n (unused) The UI cnt
  @return The number of micro inverters on the system
  */
  getUICnt(n){
    if (n==null)
      throw('JRPC::getUICnt n==null, this shouldn\'t happen');
    if (this.wss) // if we have a functioning websocket
      return next(null,n);
    return n;
  }
}

module.exports = {
  JRPC
}
