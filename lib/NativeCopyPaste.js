import {
  isCmd,
  isKey
} from 'diagram-js/lib/features/keyboard/KeyboardUtil'; 

import {
  KEYS_COPY,
  KEYS_PASTE
} from 'diagram-js/lib/features/keyboard/KeyboardBindings'; 

import {
  isObject,
  isString
} from 'min-dash';

const LOW_PRIORITY = 500;

const MIME_TYPE = 'application/x-bpmn-js';

export default class NativeCopyPaste {
  constructor(canvas, clipboard, copyPaste, eventBus, keyboard, moddle, selection) {
    const svg = canvas._svg;

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

      event.clipboardData.setData(MIME_TYPE, JSON.stringify(clipboard.get()));
      event.clipboardData.setData('text', '');

      event.preventDefault();
    };

    /**
     * @param {ClipboardEvent} event
     */
    const cutHandler = event => {};

    /**
     * @param {ClipboardEvent} event
     */
     const pasteHandler = event => {
      if (document.activeElement !== svg) {
        return;
      }

      console.log('pasting', event.clipboardData.getData(MIME_TYPE));

      const data = event.clipboardData.getData(MIME_TYPE);

      const tree = JSON.parse(data, createReviver(moddle));

      console.log('overriding tree', tree);

      clipboard.set(tree);

      copyPaste.paste();
    };

    eventBus.on('diagram.init', LOW_PRIORITY, () => {
      keyboard.addListener(5000, (context) => {
        var event = context.keyEvent;

        if (isCmd(event) && (
          isKey(KEYS_COPY, event) || isKey(KEYS_PASTE, event)
        )) {
          return false;
        }
      });

      document.body.addEventListener('copy', copyHandler);
      document.body.addEventListener('cut', cutHandler);
      document.body.addEventListener('paste', pasteHandler);
    });

    eventBus.on('diagram.destroy', LOW_PRIORITY, () => {
      document.body.removeEventListener('copy', copyHandler);
      document.body.removeEventListener('cut', cutHandler);
      document.body.removeEventListener('paste', pasteHandler);
    });
  }
}

NativeCopyPaste.$inject = [
  'canvas',
  'clipboard',
  'copyPaste',
  'eventBus',
  'keyboard',
  'moddle',
  'selection'
];

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

    if (isObject(object) && isString(object.$type)) {

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