import TestContainer from 'mocha-test-container-support';

import fileDrop from 'file-drops';

import fileOpen from 'file-open';

import download from 'downloadjs';

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
import fileDropsCSS from "./file-drops.css";

insertCSS('diagram-js.css', diagramCSS);

insertCSS('bpmn-js.css', bpmnCSS);

insertCSS('bpmn-font.css', fontCSS);

insertCSS('properties.css', propertiesPanelCSS);

insertCSS('file-drops.css', fileDropsCSS);

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
      moddleExtensions: {
        zeebe: zeebeModdlePackage
      },
      propertiesPanel: {
        parent: container
      }
    });

    await modeler.importXML(require('./ticket-booking.bpmn'));

    modeler.get('canvas')._svg.tabIndex = 0;

    var fileName = './ticket-booking.bpmn';

    function openDiagram(diagram) {
      return modeler.importXML(diagram)
        .then(({ warnings }) => {
          if (warnings.length) {
            console.warn(warnings);
          }
        })
        .catch(err => {
          console.error(err);
        });
    }

    function openFile(files) {

      // files = [ { name, contents }, ... ]

      if (!files.length) {
        return;
      }

      fileName = files[0].name;

      openDiagram(files[0].contents);
    }

    document.body.addEventListener('dragover', fileDrop('Open BPMN diagram', openFile), false);

    function downloadDiagram() {
      modeler.saveXML({ format: true }, function(err, xml) {
        if (!err) {
          download(xml, fileName, 'application/xml');
        }
      });
    }

    document.body.addEventListener('keydown', function(event) {
      if (event.code === 'KeyS' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();

        downloadDiagram();
      }

      if (event.code === 'KeyO' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();

        fileOpen().then(openFile);
      }
    });

  });

});