function getTextNodesInRange(range) {
  const result = [];
  const root = range.commonAncestorContainer;

  if (root.nodeType === Node.TEXT_NODE) {
    result.push({
      node: root,
      start: range.startOffset,
      end: range.endOffset,
    });
    return result;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);

  let node;
  while ((node = walker.nextNode())) {
    if (!range.intersectsNode(node)) continue;

    const start = node === range.startContainer ? range.startOffset : 0;
    const end =
      node === range.endContainer ? range.endOffset : node.textContent.length;

    if (start < end) {
      result.push({ node, start, end });
    }
  }

  return result;
}

function highlightRange(range, highlightId) {
  const textNodes = getTextNodesInRange(range);

  textNodes.forEach(({ node, start, end }) => {
    const nodeRange = document.createRange();
    nodeRange.setStart(node, start);
    nodeRange.setEnd(node, end);

    const mark = document.createElement('mark');
    mark.style.backgroundColor = '#ffe08a';
    mark.style.padding = '0 1px';
    mark.className = 'substack-highlighter-mark';
    if (highlightId) {
      mark.dataset.highlightId = highlightId;
    }

    try {
      nodeRange.surroundContents(mark);
    } catch (err) {
      console.warn('[Highlighter] Could not wrap text node:', err);
    }
  });
}

function unwrapMark(mark) {
  const parent = mark.parentNode;
  if (!parent) return;

  while (mark.firstChild) {
    parent.insertBefore(mark.firstChild, mark);
  }
  parent.removeChild(mark);
  parent.normalize();
}

function getVisibleText() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        const parentTag = node.parentElement ? node.parentElement.tagName : '';
        if (parentTag === 'SCRIPT' || parentTag === 'STYLE') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  let fullText = '';
  let node;
  while ((node = walker.nextNode())) {
    fullText += node.textContent;
  }
  return fullText;
}
