import TestContainer from 'mocha-test-container-support';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import { insertCSS } from '../helper';

import sampleDiagram from './sample.bpmn';

import diagramCSS from 'bpmn-js/dist/assets/diagram-js.css';

import bpmnCSS from 'bpmn-js/dist/assets/bpmn-js.css';

import fontCSS from 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

insertCSS('diagram-js.css', diagramCSS);

insertCSS('bpmn-js.css', bpmnCSS);

insertCSS('bpmn-font.css', fontCSS);

insertCSS('test', `
.djs-container svg:focus {
  outline: none;
  box-shadow: inset 0px 0px 0px 2px fuchsia;
}

.test-container {
  height: auto !important;
}

.test-container .test-content-container {
  height: 600px !important;
}
`);


describe('copy-paste', function() {

  it('participant', async function() {

    // given
    const modeler = new BpmnModeler({
      container: TestContainer.get(this),
      keyboard: {
        bindTo: document
      }
    });

    await modeler.importXML(sampleDiagram);

    // when
    copy(modeler, 'POOL');

    paste(modeler, 'COLLABORATION', { x: 600, y: 400 });

    // then
  });


  it('start event', async function() {

    // given
    const modeler = new BpmnModeler({
      container: TestContainer.get(this),
      keyboard: {
        bindTo: document
      }
    });

    await modeler.importXML(sampleDiagram);

    // when
    copy(modeler, 'START_PROCESS');

    paste(modeler, 'POOL', { x: 300, y: 130 });

    // then
  });


  it.only('should natively copy/paste', async function() {

    // given
    const modeler = new BpmnModeler({
      container: TestContainer.get(this),

      // binding keyboard will break copy and paste due to event.preventDefault
      // being called by copy and paste keyboard listeners
      // keyboard: {
      //   bindTo: document
      // }
    });

    const clipboard = modeler.get('clipboard'),
          copyPaste = modeler.get('copyPaste'),
          selection = modeler.get('selection');

    await modeler.importXML(sampleDiagram);

    const container = modeler.get('canvas').getContainer();

    const svg = container.querySelector('svg');

    const mimeType = 'application/x-bpmn-js';

    /**
     * @param {ClipboardEvent} event
     */
    const copyHandler = event => {
      if (document.activeElement !== svg) {
        return;
      }

      const selectedElements = selection.get();

      const tree = copyPaste.copy(selectedElements);

      console.log("copying", tree, JSON.stringify(clipboard.get()));

      event.clipboardData.setData(mimeType, JSON.stringify(clipboard.get()));
      event.clipboardData.setData('text', '');

      event.preventDefault();
    };

    /**
     * @param {ClipboardEvent} event
     */
    const pasteHandler = event => {
      console.log('pasting', event.clipboardData.getData(mimeType));

      const data = event.clipboardData.getData(mimeType);

      const tree = JSON.parse(data, createReviver(modeler._moddle));

      console.log('overriding tree', tree);

      clipboard.set(tree);

      copyPaste.paste();
    };

    document.body.addEventListener('copy', copyHandler);
    document.body.addEventListener('cut', copyHandler);
    document.body.addEventListener('paste', pasteHandler);

    document.body.addEventListener('focusin', event => {
      console.log(event.target);
    });
  });


});


/////////////// helpers //////////////////////////

/**
 * For the given modeler, copy an element to
 * localStorage.
 *
 * @param  {BpmnModeler} modeler
 * @param  {String} elementId
 * @param  {String} target
 * @param  {Point} position
 */
function copy(modeler, elementId) {

  var clipboard = modeler.get('clipboard'),
      copyPaste = modeler.get('copyPaste'),
      elementRegistry = modeler.get('elementRegistry');

  // get element to be copied
  var element = elementRegistry.get(elementId);

  // copy!
  copyPaste.copy(element);

  // retrieve clipboard contents
  var copied = clipboard.get();

  // persist in local storage, encoded as json
  localStorage.setItem('bpmnClipboard', JSON.stringify(copied));
}


/**
 * For the given modeler retrieved copied elements from
 * localStorage and paste them onto the specified target.
 *
 * @param  {BpmnModeler} modeler
 * @param  {String} target
 * @param  {Point} position
 */
function paste(modeler, targetId, position) {

  var clipboard = modeler.get('clipboard'),
      copyPaste = modeler.get('copyPaste'),
      elementRegistry = modeler.get('elementRegistry'),
      moddle = modeler.get('moddle');

  // retrieve from local storage
  var serializedCopy = localStorage.getItem('bpmnClipboard');

  // parse tree, reinstantiating contained objects
  var parsedCopy = JSON.parse(serializedCopy, createReviver(moddle));

  // put into clipboard
  clipboard.set(parsedCopy);

  var pasteContext = {
    element: elementRegistry.get(targetId),
    point: position
  };

  // paste tree
  copyPaste.paste(pasteContext);
}

/**
 * A factory function that returns a reviver to be
 * used with JSON#parse to reinstantiate moddle instances.
 *
 * @param  {Moddle} moddle
 *
 * @return {Function}
 */
function createReviver(moddle) {

  var elCache = {};

  /**
   * The actual reviewer that creates model instances
   * for elements with a $type attribute.
   *
   * Elements with ids will be re-used, if already
   * created.
   *
   * @param  {String} key
   * @param  {Object} object
   *
   * @return {Object} actual element
   */
  return function(key, object) {

    if (typeof object === 'object' && typeof object.$type === 'string') {

      var objectId = object.id;

      if (objectId && elCache[objectId]) {
        return elCache[objectId];
      }

      var type = object.$type;
      var attrs = Object.assign({}, object);

      delete attrs.$type;

      var newEl = moddle.create(type, attrs);

      if (objectId) {
        elCache[objectId] = newEl;
      }

      return newEl;
    }

    return object;
  };
}

/**
 * Create a full-screen test container.
 *
 * @return {Element}
 */
function testContainer() {
  var el = document.createElement('div');

  el.style.width = '100%';
  el.style.height = '100vh';
  el.style.margin = '-10px';
  el.style.position = 'absolute';

  document.body.appendChild(el);

  return el;
}