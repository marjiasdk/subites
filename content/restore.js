function restoreHighlights() {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const currentUrl = window.location.href;
    const pageHighlights = result.highlights.filter(
      (h) => h.url === currentUrl,
    );

    pageHighlights.forEach((h) => {
      const range = findRangeForText(h.text, h.contextBefore, h.contextAfter);
      if (range) {
        try {
          highlightRange(range, h.timestamp);
        } catch (err) {
          console.warn('[Highlighter] highlightRange threw an error:', err);
        }
      } else {
        console.warn('[Highlighter] Could not find highlight on page:', h.text);
      }
    });
  });
}

function findRangeForText(searchText, contextBefore, contextAfter) {
  contextBefore = contextBefore || '';
  contextAfter = contextAfter || '';

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
  const nodeMap = [];

  let node;
  while ((node = walker.nextNode())) {
    const start = fullText.length;
    fullText += node.textContent;
    nodeMap.push({ node, start, end: fullText.length });
  }

  const searchFor = contextBefore + searchText + contextAfter;
  let matchIndex = fullText.indexOf(searchFor);
  let offsetIntoMatch = contextBefore.length;

  if (matchIndex === -1) {
    matchIndex = fullText.indexOf(searchText);
    offsetIntoMatch = 0;
    if (matchIndex === -1) return null;
  }

  const startOffset = matchIndex + offsetIntoMatch;
  const endOffset = startOffset + searchText.length;

  const startPos = mapOffsetToNode(nodeMap, startOffset);
  const endPos = mapOffsetToNode(nodeMap, endOffset);

  if (!startPos || !endPos) return null;

  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);

  return range;
}

function mapOffsetToNode(nodeMap, offset) {
  for (const entry of nodeMap) {
    if (offset >= entry.start && offset <= entry.end) {
      return { node: entry.node, offset: offset - entry.start };
    }
  }
  return null;
}

function waitForContentThenRestore() {
  let restored = false;

  const observer = new MutationObserver((mutations, obs) => {
    const paragraphCount = document.querySelectorAll('p').length;
    if (paragraphCount > 3 && !restored) {
      restored = true;
      obs.disconnect();
      clearTimeout(fallbackTimer);
      restoreHighlights();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const fallbackTimer = setTimeout(() => {
    if (!restored) {
      restored = true;
      observer.disconnect();
      restoreHighlights();
    }
  }, 5000);
}
