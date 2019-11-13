"use strict";

const multicastdns = require('multicast-dns');

class MDNS {
  /** Constructor sets the default port and MDNS options
  */
  constructor (){
    this.serviceName='HardwareServer.local';
    this.serviceDetailName='battery-hardware';
    this.port=9100;
    this.mdnsOpt={ multicast: true, // use udp multicasting
                    // interface: '192.168.0.2' // explicitly specify a network interface. defaults to all
                    port: this.port, // set the udp port
                    // ip: ipAdd, // set the udp ip
                    ttl: 255, // set the multicast ttl
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
        if (element.name === this.serviceDetailName)
          params.port = element.data.port;
        else if (element.name === this.serviceName)
          params.host=element.data;
      });
      if (params.port && params.host)
        this.connectToServer(params);
      else
        console.log('MDNS response didn\'t contain both a port and host, not connecting '+params)
      // console.log(response.answers[0].data)
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
    let response = {answers: [{name: this.serviceDetailName, type: 'SRV',
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
