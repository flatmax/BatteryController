import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

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
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'plot-power',
      },
    };
  }
}

window.customElements.define('plot-power', PlotPower);
