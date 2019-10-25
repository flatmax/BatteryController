import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

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
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'log-parser',
      },
    };
  }
}

window.customElements.define('log-parser', LogParser);
