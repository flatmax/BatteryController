#!/usr/bin/env node
// 'use strict';

const fs = require('fs');

const Table = require('webApp/src/log-parser/Table.js');

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
      fs.writeFileSync('/tmp/batteryLog.json', JSON.stringify(table.records));
      console.log('File processed, json written.');
    });

  } catch (err) {
    console.error(err);
  }
})();
