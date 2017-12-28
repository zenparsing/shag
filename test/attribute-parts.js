import { html, applyTemplate } from '../src';
import { vdom } from '../src/extras';
import assert from 'assert';
import { createPushStream } from './observable.js';

describe('Attribute part updaters', () => {
  let document = new vdom.Document();

  function assertResult(template, expected) {
    let target = document.createElement('div');
    applyTemplate(target, template);
    let actual = target.childNodes[0].toDataObject().attributes;
    assert.deepEqual(actual, expected);
  }

  it('concatenates strings', () => {
    assertResult(html`<div x='a${'b'}c' />`, {
      x: 'abc',
    });
  });

  it('does not update until pending values are available', () => {
    let stream = createPushStream();
    let target = document.createElement('div');
    applyTemplate(target, html`<div x='a${'b'}${stream}d' />`);
    let div = target.childNodes[0];
    assert.deepEqual(div.toDataObject().attributes, {});
    stream.next('c');
    assert.deepEqual(div.toDataObject().attributes, { x: 'abcd' });
  });

});