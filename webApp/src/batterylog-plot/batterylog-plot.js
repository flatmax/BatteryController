import {html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input.js';
import {LogParser} from 'log-parser/log-parser.js';
import 'plot-power/plot-power.js';
import moment from 'moment';

/**
 * `batterylog-plot`
 * Parse the battery log to the plot
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class BatterylogPlot extends LogParser {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        span {
          font-size: 11px;
          color: #aaa;
        }
        div {
          height: 300px;
        }
      </style>
      <h3>Select the date</h3>
      <paper-input type="date" value="{{defaultDate()}}" on-value-changed="plot"></paper-input>
      <span>Default to the last 24 hours</span>
      <div>
        <plot-power id="pp"></plot-power>
      </div>
    `;
  }
  static get properties() {
    return {
      logDate: {
        type: String,
        value: moment()
      },
    };
  }

  defaultDate() {
    return this.logDate.format('YYYY-MM-DD')
  }
  
  /** Display records
  */
  plot(e){
    let datetime = this.logDate;

    // If user change the date
    if (e)
      datetime = moment(e.target.value+" 23:59:59");

    // The data range for the last 24 hours from the date set
    const dateMax = datetime.valueOf();
    const dateMin = datetime.subtract(24, 'hour').valueOf();
    let table = {
      record : this.table.record,
      records : []
    };
    this.table.records.forEach((t, i)=>{
      if (t.Date > dateMin && t.Date <= dateMax)
        table.records.push(t)
      if (i == this.table.records.length-1) {
        this.$.pp.plot(table);
        // Bug: We need to run twice the plot to display the correct curve
        this.$.pp.plot(table);
      }
    })
  }
}

window.customElements.define('batterylog-plot', BatterylogPlot);
