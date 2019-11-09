import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {Table} from './Table.js';

/**
 * `log-parser`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class LogParser extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
    `;
  }
  static get properties() {
    return {
      baseLogFileName: {
        type: String,
        value: 'batteryLog',
      },
      daysBack:{ // the number of days back to go in retrieving data
        type: Number,
        value: -2
      }
    };
  }

  connectedCallback(){
    super.connectedCallback();
    this.table = new Table;
    this.fetchLogFiles(this.daysBack);
  }

  /** Iteratively fetch log file from a particular day startDaysBack to today
  @param startDaysBack <=0 the number of days back from today.
  */
  fetchLogFiles(startDaysBack){
    let d = new Date();
    if (startDaysBack>0)
      return this.plot();
    d=new Date(d.getTime()+startDaysBack*24*60*60*1000); // days back in milliseconds
    let day = ("0" + d.getDate()).slice(-2);
    let mon = ("0" + (d.getMonth() + 1)).slice(-2);
    let year = d.getFullYear();
    let ymd=year+'-'+mon+'-'+day;

    // this.logFileName=this.baseLogFileName+'.'+ymd+'.txt';
    let fn='data/batteryLog.'+ymd+'.txt';
    console.log('fetching log file '+fn);
    return fetch(fn).then((response) => {
      return response.body.getReader();
    }).then((reader) => {
      this.iterateTextLines(reader).then(()=>{
          console.log('done')
          return this.fetchLogFiles(startDaysBack+1);
      });
    });
  }

  getFile(fn){
    fetch('data/'+fn)
    .then((response) => console.log(response.text()))
  }

  /** Recursively stream the log file and split into lines.
  For each line, pare it with the Table
  */
  iterateTextLines(reader) {
    console.log(reader)
    const utf8Decoder = new TextDecoder("utf-8");
    let finished=false;
    return reader.read().then((res) => {
      res.value = res.value ? utf8Decoder.decode(res.value) : "";

      let re = /\n|\r|\r\n/gm;
      if (this.startIndex == null)
        this.startIndex = 0;

      if (this.remainder != null)
        res.value = this.remainder + res.value;

      for (;;) {
        let result = re.exec(res.value);
        if (!result) {
          if (res.done) {
            this.remainder=null;
            this.startIndex=null;
            finished=true;
            break;
          }
          this.remainder = res.value.substr(this.startIndex);
          this.startIndex = re.lastIndex = 0;
          return this.iterateTextLines(reader);
        } else {
          let line = res.value.substring(this.startIndex, result.index);
          this.table.parseLine(line);
          this.startIndex = re.lastIndex;
        }
      }
      if (res.done && this.startIndex < res.value.length) {
        let line = res.value.substr(this.startIndex);
        this.table.parseLine(line);
      }
    });
  }

  /** Display records
  */
  plot(){
    console.log('plotting');
  }
}

window.customElements.define('log-parser', LogParser);
