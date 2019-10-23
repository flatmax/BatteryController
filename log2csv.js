#!/usr/bin/env node
// 'use strict';

const fs = require('fs');

class Table {
  constructor(){
    this.record=null;
    this.records=[];
  }

  parseLine(line){
    line = line.replace(/[^\x00-\x7F]/g,"");
    // console.log(line);
    let tokens=line.split(' ');
    // console.log(tokens)
    if (tokens[0].length){
      try {
        this[tokens[0]](tokens.slice(1));
      } catch (e) { // print info on error
        console.log(line);
        if (!this[tokens[0]])
          return;
        console.log(tokens);
        // console.log(tokens.slice(1));
        console.log(e);
        throw(e);
      }
    }
  }

  Date(tokens){
    if (this.record!==null && this.record.Date!=null)
      this.records.push(this.record);
    this.record={};
    this.record.Date=(new Date(tokens[0])).getTime();
  }

  Battery(tokens){
    if (this.record && this.record.Battery){
      this.record=null;
    }
    if (this.record==null || this.record.Date==null){
      console.log(tokens)
      console.log('skipping Battery as date is null')
      return;
    }
    this.record.Battery={};
    this.record.Battery.type=tokens[0].substring(1,tokens[0].length-1);
    this.record.Battery.state=tokens[1];
    this.record.Battery.power=tokens[2];
    this.record.Battery.percent=tokens[4].substring(0,tokens[4].length-1);
  }

  Meter(tokens){
    if (this.record && (this.record.Meter || this.record.runLevel)){
      this.record=null;
    }
    if (this.record==null || this.record.Date==null){
      console.log(tokens)
      console.log('skipping Meter as date is null')
      return;
    }
    this.record.Meter={};
    this.record.runLevel={};
    this.record.Meter.consumption = tokens[0];
    this.record.Meter.production = tokens[2];
    this.record.Meter.total = tokens[4];
    this.record.runLevel = tokens[8];
  }

  uBattery(tokens){
    if (this.record && this.record.uBattery){
      this.record=null;
    }
    if (this.record==null || this.record.Date==null){
      console.log(tokens)
      console.log('skipping uBattery as date is null')
      return;
    }
    this.record.uBattery={};
    this.record.uBattery.name = tokens[0];
    this.record.uBattery.chargerState = tokens.slice(4,7);
    this.record.uBattery.inverterState = tokens.slice(11,14);
  }

  toFile(fn){
    fs.writeFileSync(fn, JSON.stringify(this.records));
  }
}

const { once } = require('events');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

let table = new Table;

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('/tmp/batteryLog.txt', "utf8"),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      // Process the line.
      // console.log(line)
      table.parseLine(line);
    });

    // await once(rl, 'close');

    rl.on('close', ()=>{
      table.toFile('/tmp/batteryLog.json');
      console.log('File processed, json written.');
    });

  } catch (err) {
    console.error(err);
  }
})();
