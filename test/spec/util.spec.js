import {
  readClipboard,
  writeClipboard
} from '../../util';


describe('util', function() {

  it('should copy and paste', async function() {

    // given
    const object = { "foo": "BAR" };

    // when
    await writeClipboard(object);

    const copiedObject = await readClipboard();

    // then
    expect(copiedObject).to.eql(object);
  });

});