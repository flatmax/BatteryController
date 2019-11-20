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
"use strict";

const multicastdns = require('multicast-dns');

class MDNS {
  /** Constructor sets the default port and MDNS options
  */
  constructor (){
    this.serviceName='HardwareServer.local';
    this.name = require('os').hostname();
    this.port=9100;
    this.ttl=1;
    this.mdnsOpt={ multicast: true, // use udp multicasting
                    // port: this.port, // set the udp port
                    ttl: this.ttl, // set the multicast ttl
                    reuseAddr: true // set the reuseAddr option when creating the socket (requires node >=0.11.13)
                  }
  }

  /** Find available servers and connect to whichever servers are possible
  */
  findAvailableServers(){
    this.mdns = new multicastdns(this.mdnsOpt);
    this.mdns.on('warning', function (err) {
      console.log(err.stack)
    });
    this.mdns.on('response', (response) => {
      let params={};
      response.answers.filter(element => {
        if (element.name === this.serviceName)
          params.host=element.data;
        else
          if (element.data && element.type === 'SRV') {
            params.port = element.data.port;
            params.name = element.name;
          }
      });
      if (params.port && params.host && params.name)
        this.connectToServer(params);
      else
        console.log('MDNS response didn\'t contain a port, host and name, not connecting '+params)
    });
    this.mdns.query(this.serviceName, 'A');
  }

  /** Create a multicast DNS advertisement
  */
  createMDNSServer(){
    let opt=this.mdnsOpt;
    opt.loopback = true; // receive your own packets
    this.mdns = multicastdns(opt);
    // setup the response
    const ipAdd=require('ip').address();
    console.log()
    let response = {answers: [{name: this.name, type: 'SRV',
                                data: { port:this.port, weigth: 0, priority: 10, target: 'battery' } },
                              { name: this.serviceName, type:'A', data: ipAdd } ]};
    this.mdns.on('query', (query) => {
      if (query.questions[0] && query.questions[0].name === this.serviceName){
        console.log('MDNS new query')
        this.mdns.respond(response);
      }
    });
  }

  /** Connect to a server
  @param params host and port if required for example params = {host : "127.0.0.1", port: 9100}
  */
  connectToServer(params){
    console.log(params)
    console.log('MDNS::connectToServer : should be overloaded but isn\'t, no server started');
  }
}

module.exports = {
  MDNS
}
