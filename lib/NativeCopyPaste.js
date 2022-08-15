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

/**
 * An extension that adds browser native copy + paste
 * to an existing bpmn-js instance.
 *
 * Contents of the diagram will be pushed into the
 * system clipboard and read from it during paste.
 */
export default class NativeCopyPaste {

  constructor(
      canvas, clipboard, editorActions,
      eventBus, keyboard, moddle,
      selection) {

    const svg = canvas._svg;

    /**
     * @param {ClipboardEvent} event
     */
    const copyHandler = event => {
      if (document.activeElement !== svg) {
        return;
      }

      const copied = editorActions.trigger('copy');

      if (!copied) {
        return;
      }

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

      const data = event.clipboardData.getData(MIME_TYPE);

      if (data === '') {
        return;
      }

      const tree = JSON.parse(data, createReviver(moddle));

      clipboard.set(tree);

      editorActions.trigger('paste');
    };

    // disable bpmn-js core CTRL/CMD copy and paste bindings
    eventBus.on('diagram.init', LOW_PRIORITY, () => {
      keyboard.addListener(5000, (context) => {
        const event = context.keyEvent;

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
  'editorActions',
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

  const elementCache = {};

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

      const { id } = object;

      if (id && elementCache[ id ]) {
        return elementCache[ id ];
      }

      const type = object.$type;

      const attrs = Object.assign({}, object);

      delete attrs.$type;

      const descriptor = moddle.getTypeDescriptor(type);

      if (!descriptor) {
        return;
      }

      const newElement = moddle.create(type, attrs);

      if (id) {
        elementCache[ id ] = newElement;
      }

      return newElement;
    }

    return object;
  };
}