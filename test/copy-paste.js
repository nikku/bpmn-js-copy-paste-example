import BpmnModeler from 'bpmn-js/lib/Modeler';

import sampleDiagram from './sample.bpmn';



describe('copy-paste', function() {

  var modeler = new BpmnModeler({
    container: testContainer()
  });


  it('should copy/paste', function(done) {

    modeler.importXML(sampleDiagram, function(err) {

      if (err) {
        return done(err);
      }

      // copy/paste a whole pool
      copy(modeler, 'POOL');
      paste(modeler, 'COLLABORATION', { x: 600, y: 400 });

      // copy/paste a start event only
      copy(modeler, 'START_PROCESS');
      paste(modeler, 'POOL', { x: 300, y: 130 });

      done();
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