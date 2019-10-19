import assert from 'assert';
import { html, applyTemplate } from '../src';
import { createDocument } from '../src/extras/vdom.js';
import AsyncIterationBuffer from 'async-iteration-buffer';

describe('Attribute part updaters', () => {
  let document = createDocument();

  function assertResult(template, expected) {
    let target = document.createElement('div');
    applyTemplate(target, template);
    let actual = target.firstElementChild.toDataObject().attributes;
    assert.deepEqual(actual, expected);
  }

  it('concatenates strings', () => {
    assertResult(html`<div x='a${'b'}c' />`, {
      x: 'abc',
    });
  });

  it('joins array values with spaces', () => {
    assertResult(html`<div x='a ${['b', 'c']} d' />`, {
      x: 'a b c d',
    });
  });

  it('joins iterable values with spaces', () => {
    function* g() { yield 'b'; yield 'c'; }
    assertResult(html`<div x='a ${g()} d' />`, {
      x: 'a b c d',
    });
  });

  it('does not update until pending values are available', async () => {
    let buffer = new AsyncIterationBuffer();
    let target = document.createElement('div');
    applyTemplate(target, html`<div x='a${'b'}${buffer}d' />`);
    let div = target.firstElementChild;
    await null;
    assert.deepEqual(div.toDataObject().attributes, {});
    await buffer.next('c');
    assert.deepEqual(div.toDataObject().attributes, { x: 'abcd' });
    await buffer.next('C');
    assert.deepEqual(div.toDataObject().attributes, { x: 'abCd' });
  });

});
