import htmltag from 'htmltag';
import { Element } from './Element.js';

export { Element };
export { renderToDOM } from './render-dom.js';
export { renderToString } from './render-string.js';
export { UI } from './UI.js';

export function createElement(tag, props, children) {
  return new Element(tag, props, children);
}

export const html = htmltag(createElement, {
  createFragment: Element.from,
});
