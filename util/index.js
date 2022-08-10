export const BPMN_JS_MIME_TYPE = 'application/x-bpmn-js';

/**
 * @return {any}
 */
export async function readClipboard() {

  const permission = await navigator.permissions.query({
    name: 'clipboard-read'
  });

  if (permission.state === 'denied') {
    throw new Error('Not allowed to read clipboard.');
  }

  const clipboardContents = await navigator.clipboard.read();

  for (const item of clipboardContents) {

    if (item.types.includes(BPMN_JS_MIME_TYPE)) {
      const blob = await item.getType(BPMN_JS_MIME_TYPE);

      return JSON.parse(blob.text());
    }
  }

  return null;
}

/**
 * @param {any} contents
 */
export async function writeClipboard(contents) {
  await navigator.clipboard.write([
    new ClipboardItem({
      [ BPMN_JS_MIME_TYPE ]: new Blob([ JSON.stringify(contents) ], {
        type: BPMN_JS_MIME_TYPE
      })
    })
  ]);
}