import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import * as d3 from 'd3/index.js';

/**
 * `plot-power`
 * Plot battery logs
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class PlotPower extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <svg id="svg"></svg>
    `;
  }
  static get properties() {
    return {
      yMax: {
        type: Number,
        value: -1e100,
      },
      yMin: {
        type: Number,
        value: 1e100,
      },
    };
  }

  connectedCallback(){
    super.connectedCallback();
    // setup the SVG
    this.height = this.parentNode.offsetHeight;
    this.width = this.parentNode.offsetWidth;
    this.$.svg.setAttribute("width", this.width-50);
    this.$.svg.setAttribute("height", this.height-50);
    this.svg = d3.select(this.$.svg);
    this.positionAxes();
  }

  positionAxes(){
    this.svg.attr('viewBox', (this.$.svg.width.baseVal.value - this.width)/2 +' -10 ' + this.width + ' ' + (this.height+30));
    // setup the axes
    if (!this.yAxis)
      this.yAxis = d3.scaleLinear().range([this.height-50, 0]);
    else
      this.yAxis = this.yAxis.range([this.height-50, 0]);
    if (!this.yAxisG)
      this.yAxisG=this.svg.append("g");// Add the Y Axis
    this.yAxisG.call(d3.axisLeft(this.yAxis)); // put the y axis on the left

    if (!this.xAxis)
      this.xAxis = d3.scaleLinear().range([0, this.width-50-50]);
    if (!this.xAxisG)
      this.xAxisG=this.svg.append("g")// Add the X Axis
    this.xAxisG.attr("transform", "translate(0," + (this.height-50) + ")") // height can be adjusted here to show the text below the ticks
            .call(d3.axisBottom(this.xAxis)); // put the x axis on the bottom
  }

  // plot the data to the SVG
  plot(table){
    console.log('plot')
    this.positionAxes();
    if (!this.consumptionLine){ // setup the line
      this.consumptionLine = d3.line();
      this.consumptionLine.x((d)=>{return this.xAxis(d.Date);})
               .y((d)=>{this.setYDomain(parseFloat(d.Meter.consumption)); return this.yAxis(d.Meter.consumption);})
               // check that we don't have NaN or Infinite numbers in the y values.
               .defined(function(d) {return ((!isNaN(d.Meter.consumption))&&isFinite(d.Meter.consumption));});
     }
     if (!this.productionLine){ // setup the line
       this.productionLine = d3.line();
       this.productionLine.x((d)=>{return this.xAxis(d.Date);})
                .y((d)=>{this.setYDomain(parseFloat(d.Meter.production)); return this.yAxis(d.Meter.production);})
                .defined(function(d) {return ((!isNaN(d.Meter.production))&&isFinite(d.Meter.production));});
    }
    if (!this.totalLine){ // setup the line
      this.totalLine = d3.line();
      this.totalLine.x((d)=>{return this.xAxis(d.Date);})
               .y((d)=>{let val=parseFloat(d.Meter.consumption)+parseFloat(d.Meter.production); return this.yAxis(val);})
   }

   this.xAxis.domain([table.records[0].Date, table.records[table.records.length-1].Date]);
   this.xAxisG.call(d3.axisBottom(this.xAxis));
   this.yAxisG.call(d3.axisLeft(this.yAxis));

   if (this.svg.select(".lines.consumption").empty()) // create the consumption line if it doesn't exist
     this.svg.append("path").attr("class", "lines consumption").attr("fill", "none").attr("stroke", 'red');
   if (this.svg.select(".lines.production").empty()) // create the production line if it doesn't exist
     this.svg.append("path").attr("class", "lines production").attr("fill", "none").attr("stroke", 'green');
   if (this.svg.select(".lines.total").empty()) // create the total line if it doesn't exist
     this.svg.append("path").attr("class", "lines total").attr("fill", "none").attr("stroke", 'black');
   // draw the consumption, duration in ms
   this.svg.transition().select(".consumption").duration(1000).attr("d", this.consumptionLine(table.records));
   this.svg.transition().select(".production").duration(1000).attr("d", this.productionLine(table.records));
   this.svg.transition().select(".total").duration(1000).attr("d", this.totalLine(table.records));
  }

  setYDomain(val){
    if (val>this.yMax){
      this.yMax=val;
      this.yAxis.domain([this.yMin, this.yMax]);
    }
    if (val<this.yMin){
      this.yMin=val;
      this.yAxis.domain([this.yMin, this.yMax]);
    }
  }
}

window.customElements.define('plot-power', PlotPower);
