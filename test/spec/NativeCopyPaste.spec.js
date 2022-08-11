import TestContainer from 'mocha-test-container-support';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import NativeCopyPasteModule from '../..';

import { insertCSS } from '../helper';

import diagramCSS from 'bpmn-js/dist/assets/diagram-js.css';

import bpmnCSS from 'bpmn-js/dist/assets/bpmn-js.css';

import fontCSS from 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

insertCSS('diagram-js.css', diagramCSS);

insertCSS('bpmn-js.css', bpmnCSS);

insertCSS('bpmn-font.css', fontCSS);

insertCSS('test', `
.test-container {
  height: auto !important;
}

.test-container .test-content-container {
  height: 600px !important;
}

.test-button {
  position: absolute;
  bottom: 20px;
  left: 20px;
}
`);


describe('NativeCopyPaste', function() {

  it('should copy and paste manually', async function() {

    // given
    const modeler = new BpmnModeler({
      container: TestContainer.get(this),
      additionalModules: [
        NativeCopyPasteModule
      ],
      keyboard: {
        bindTo: document
      }
    });

    await modeler.importXML(require('./ticket-booking.bpmn'));

    document.body.addEventListener('focusin', event => {
      console.log(event.target);
    });
  });

});