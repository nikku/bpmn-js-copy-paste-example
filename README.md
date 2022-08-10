# bpmn-js-copy-paste-example

[![CI](https://github.com/nikku/bpmn-js-copy-paste-example/actions/workflows/CI.yml/badge.svg)](https://github.com/nikku/bpmn-js-copy-paste-example/actions/workflows/CI.yml)

An example implementation of copy and paste using the native clipboard. Allows you to copy and paste across applications. Want to paste into Microsoft Word? Go ahead!

## Setup

```javascript
import NativeCopyPaste from 'bpmn-js-copy-paste-example';

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
```

## Run the Example

```sh
# install dependencies
npm install

# run in Chrome
npm run dev
```

Use `F12` in your browser to open the dev tools to see what the heck is going on.


## License

MIT

:heart: