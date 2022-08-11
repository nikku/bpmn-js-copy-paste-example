# bpmn-js-copy-paste-example

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

Open [`http://localhost:9876/debug.html`](http://localhost:9876/debug.html) in a browser (recommendation: Chrom(ium)) and use `F12` to open the dev tools to see what the heck is going on.


## License

MIT

:heart:
