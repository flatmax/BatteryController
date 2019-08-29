#!/usr/bin/env node
'use strict';
const http = require('http');
let ip='192.168.1.60'

class Envoy {
  constructor(ip){this.ip=ip;}

  getData(){
    return new Promise((resolve, reject) => {
      http.get('http://'+ip+'/production.json', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          resolve(JSON.parse(data));
        });

      }).on("error", (err) => {
        console.log("Error: " + err.message);
        reject(err);
      });
    });
  }

  reportProdCons(){
    return this.getData().then((data) => {
      // console.log(data)
      let inv = data.production[0];
      console.log(inv.type + ' N=' + inv.activeCount + ' : ' + Math.round(inv.wNow)/1e3 + ' kW');
      let prod = data.production[1];
      console.log(prod.type + ' ' + prod.measurementType + ' : ' + Math.round(prod.wNow)/1e3 + ' kW');

      let total = data.consumption[0];
      console.log(total.type + ' ' + total.measurementType + ' : ' + Math.round(total.wNow)/1e3 + ' kW');
      let net = data.consumption[1];
      console.log(net.type + ' ' + net.measurementType + ' : ' + Math.round(net.wNow)/1e3 + ' kW');

      let storage = data.storage[0];
      console.log('storage')
      console.log(storage.type + ' N=' + storage.activeCount + ' : ' + Math.round(storage.wNow)/1e3 + ' kW');
      console.log(storage.state + ' : ' + Math.round(storage.whNow)/1e3 + ' kWh, full : ' + storage.percentFull + '%');
      console.log('======== consumption =================')
      console.log(-Math.round(prod.wNow)/1e3 + ' | ' + Math.round(total.wNow)/1e3 + ' | ' + Math.round(net.wNow)/1e3 + ' kW')
      console.log()
    });
  }
}

let envoy = new Envoy(ip);
setInterval(envoy.reportProdCons.bind(envoy), 2000);
