function findChild(parent, node) {
  let i = parent.childNodes.indexOf(node);
  if (i < 0) {
    throw new Error('Node is not a child');
  }
  return i;
}

function isFragment(x) {
  return x.nodeType === 11;
}

class Document {
  createTextNode(text) {
    return new TextNode(this, text);
  }

  createDocumentFragment() {
    return new DocumentFragment(this);
  }

  createElement(tag) {
    return new Element(this, tag);
  }

  createElementNS(namespace, tag) {
    let e = new Element(this, tag);
    e.namespaceURI = namespace;
    return e;
  }
}

class Node {
  constructor(doc, type, name) {
    this.nodeType = type;
    this.nodeName = name;
    this.ownerDocument = doc;
    this.parentNode = null;
    this.nextSibling = null;
    this.namespaceURI = null;
  }
}

class ParentNode extends Node {
  constructor(doc, type, name) {
    super(doc, type, name);
    this.childNodes = [];
  }

  get firstChild() {
    return this.childNodes.length > 0 ? this.childNodes[0] : null;
  }

  get lastChild() {
    let length = this.childNodes.length;
    return length > 0 ? this.childNodes[length - 1] : null;
  }

  removeChild(node) {
    let pos = findChild(this, node);
    if (pos > 0) {
      this.childNodes[pos - 1].nextSibling = node.nextSibling;
    }
    this.childNodes.splice(pos, 1);
    node.parentNode = null;
    node.nextSibling = null;
  }

  insertBefore(newNode, next) {
    let pos = next ? findChild(this, next) : this.childNodes.length;
    if (isFragment(newNode)) {
      if (newNode.childNodes.length > 0) {
        newNode.lastChild.nextSibling = next;
        if (pos > 0) {
          this.childNodes[pos - 1].nextSibling = newNode.firstChild;
        }
        this.childNodes.splice(pos, 0, ...newNode.childNodes);
        for (let i = 0; i < newNode.childNodes.length; ++i) {
          newNode.childNodes[i].parentNode = this;
        }
        newNode.childNodes.length = 0;
      }
    } else {
      if (pos > 0) {
        this.childNodes[pos - 1].nextSibling = newNode;
      }
      this.childNodes.splice(pos, 0, newNode);
      newNode.parentNode = this;
      newNode.nextSibling = next;
    }
  }
}

class DocumentFragment extends ParentNode {
  constructor(doc) {
    super(doc, 11, '#document-fragment');
  }

  toDataObject() {
    return {
      nodeName: this.nodeName,
      childNodes: this.childNodes.map(child => child.toDataObject()),
    };
  }
}

class Element extends ParentNode {
  constructor(doc, tag) {
    super(doc, 1, tag);
    this.attributes = new Map();
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  toDataObject() {
    let attributes = {};
    this.attributes.forEach((value, key) => attributes[key] = value);
    return {
      nodeName: this.nodeName,
      attributes,
      childNodes: this.childNodes.map(child => child.toDataObject()),
    };
  }
}

class TextNode extends Node {
  constructor(doc, text) {
    super(doc, 3, '#text');
    this.nodeValue = text;
  }

  toDataObject() {
    return this.nodeValue;
  }
}

exports.Document = Document;
