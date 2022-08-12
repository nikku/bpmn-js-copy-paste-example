import TestContainer from 'mocha-test-container-support';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule
} from "bpmn-js-properties-panel";

import zeebeModdlePackage from "zeebe-bpmn-moddle/resources/zeebe";
import zeebeModdleExtension from "zeebe-bpmn-moddle/lib";

import NativeCopyPasteModule from '../..';

import { insertCSS } from '../helper';

import diagramCSS from 'bpmn-js/dist/assets/diagram-js.css';

import bpmnCSS from 'bpmn-js/dist/assets/bpmn-js.css';

import fontCSS from 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

import propertiesPanelCSS from "bpmn-js-properties-panel/dist/assets/properties-panel.css";

insertCSS('diagram-js.css', diagramCSS);

insertCSS('bpmn-js.css', bpmnCSS);

insertCSS('bpmn-font.css', fontCSS);

insertCSS('properties.css', propertiesPanelCSS);

insertCSS('test', `
.test-container {
  height: auto !important;
}

.test-container .test-content-container {
  height: 600px !important;
  display: flex;
}

.test-button {
  position: absolute;
  bottom: 20px;
  left: 20px;
}

.bio-properties-panel-container {
  width: 300px;
  order: 1;
  border-left: solid 1px hsl(225, 10%, 75%);
}
`);


describe('NativeCopyPaste', function() {

  it('should copy and paste manually', async function() {

    // given
    const container = TestContainer.get(this);

    const modeler = new BpmnModeler({
      container,
      additionalModules: [
        NativeCopyPasteModule,
        zeebeModdleExtension,
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ZeebePropertiesProviderModule
      ],
      keyboard: {
        bindTo: document
      },
      moddleExtensions: {
        zeebe: zeebeModdlePackage
      },
      propertiesPanel: {
        parent: container
      }
    });

    await modeler.importXML(require('./ticket-booking.bpmn'));

    document.body.addEventListener('focusin', event => {
      console.log(event.target);
    });
  });

});