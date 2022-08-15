# bpmn-js-native-copy-paste

[![CI](https://github.com/nikku/bpmn-js-native-copy-paste/actions/workflows/CI.yml/badge.svg)](https://github.com/nikku/bpmn-js-native-copy-paste/actions/workflows/CI.yml)

Copy and paste for [bpmn-js](https://github.com/bpmn-io/bpmn-js) implemented using the native operating system clipboard. Also, works across browser and application windows.


## Usage

```javascript
import NativeCopyPaste from 'bpmn-js-native-copy-paste';

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


## Build and Run

```sh
# install dependencies
npm install

# run development setup
npm run dev
```

Open multiple instances of the [test site](http://localhost:9876/debug.html) and copy/paste across.


## License

MIT

:heart: