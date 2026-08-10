let highlightButton = null;

document.addEventListener('mouseup', (e) => {
  if (highlightButton && highlightButton.contains(e.target)) {
    return;
  }

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (highlightButton) {
    highlightButton.remove();
    highlightButton = null;
  }

  if (selectedText.length > 0) {
    showSaveButton(selection, e);
  }
});

function showSaveButton(selection, event) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Find the nearest block-level container (paragraph, etc.) to get the article's right edge
  let containerEl = range.startContainer;
  if (containerEl.nodeType === Node.TEXT_NODE) {
    containerEl = containerEl.parentElement;
  }
  const articleBlock = containerEl.closest('p, div, article') || containerEl;
  const articleRect = articleBlock.getBoundingClientRect();

  highlightButton = document.createElement('div');
  highlightButton.style.position = 'absolute';

  // Vertical position tracks the selection
  highlightButton.style.top = `${window.scrollY + rect.top}px`;

  // Horizontal position is FIXED to the right edge of the article column
  highlightButton.style.left = `${window.scrollX + articleRect.right + 16}px`;

  highlightButton.style.zIndex = '999999';
  highlightButton.style.display = 'flex';
  highlightButton.style.gap = '4px';
  highlightButton.style.transition = 'opacity 0.15s ease';
  highlightButton.style.opacity = '0';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save highlight';
  styleButton(saveBtn);

  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showNoteInput(selection, range);
  });

  highlightButton.appendChild(saveBtn);
  document.body.appendChild(highlightButton);

  requestAnimationFrame(() => {
    highlightButton.style.opacity = '1';
  });
}

function showNoteInput(selection, range) {
  const text = selection.toString().trim();
  const savedRange = range.cloneRange();

  // Clear the button container and replace with an input UI
  highlightButton.innerHTML = '';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Why did you highlight this? (optional)';
  input.style.padding = '6px 8px';
  input.style.borderRadius = '6px';
  input.style.border = '1px solid #ccc';
  input.style.fontSize = '13px';
  input.style.width = '240px';

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Save';
  styleButton(confirmBtn);
  confirmBtn.style.marginLeft = '6px';

  confirmBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    finalizeSave(text, savedRange, input.value.trim());
  });

  // Allow pressing Enter to save too
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      finalizeSave(text, savedRange, input.value.trim());
    }
  });

  highlightButton.appendChild(input);
  highlightButton.appendChild(confirmBtn);
  input.focus();
}

function finalizeSave(text, range, note) {
  highlightRange(range);

  const context = getSurroundingContext(range);

  const highlightData = {
    text,
    note,
    contextBefore: context.before,
    contextAfter: context.after,
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
  };

  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights;
    highlights.push(highlightData);
    chrome.storage.local.set({ highlights }, () => {
      console.log('Saved to storage:', highlightData);
    });
  });

  if (highlightButton) {
    highlightButton.remove();
    highlightButton = null;
  }
}

function getSurroundingContext(range) {
  const CONTEXT_LENGTH = 30;

  const fullText = document.body.innerText;
  const selectedText = range.toString();
  const index = fullText.indexOf(selectedText);

  if (index === -1) {
    return { before: '', after: '' };
  }

  const before = fullText.slice(Math.max(0, index - CONTEXT_LENGTH), index);
  const after = fullText.slice(
    index + selectedText.length,
    index + selectedText.length + CONTEXT_LENGTH,
  );

  return { before, after };
}

function styleButton(btn) {
  btn.style.padding = '7px 12px';
  btn.style.background = '#ff6719';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '20px'; // pill-shaped, feels more modern
  btn.style.fontSize = '13px';
  btn.style.fontWeight = '500';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
  btn.style.whiteSpace = 'nowrap';
}

function highlightRange(range) {
  const textNodes = getTextNodesInRange(range);

  textNodes.forEach(({ node, start, end }) => {
    const nodeRange = document.createRange();
    nodeRange.setStart(node, start);
    nodeRange.setEnd(node, end);

    const mark = document.createElement('mark');
    mark.style.backgroundColor = '#ffe08a';
    mark.style.padding = '0 1px';
    mark.className = 'substack-highlighter-mark';

    try {
      nodeRange.surroundContents(mark);
    } catch (err) {
      console.warn('[Highlighter] Could not wrap text node:', err);
    }
  });
}

function getTextNodesInRange(range) {
  const result = [];
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    null,
  );

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

function restoreHighlights() {
  console.log(
    '[Highlighter] restoreHighlights called, body text length:',
    document.body.innerText.length,
  );
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const currentUrl = window.location.href;
    console.log('[Highlighter] Current URL:', currentUrl);
    console.log('[Highlighter] All stored highlights:', result.highlights);

    const pageHighlights = result.highlights.filter(
      (h) => h.url === currentUrl,
    );
    console.log(
      '[Highlighter] Matching highlights for this URL:',
      pageHighlights,
    );

    pageHighlights.forEach((h) => {
      const range = findRangeForText(h.text, h.contextBefore, h.contextAfter);
      console.log(
        '[Highlighter] Looking for:',
        JSON.stringify(h.text),
        '-> found range:',
        !!range,
      );
      if (range) {
        try {
          highlightRange(range);
          console.log('[Highlighter] Successfully highlighted:', h.text);
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
  const observer = new MutationObserver((mutations, obs) => {
    const paragraphCount = document.querySelectorAll('p').length;
    if (paragraphCount > 3) {
      obs.disconnect();
      console.log(
        '[Highlighter] Content detected (',
        paragraphCount,
        'paragraphs). Restoring highlights now.',
      );
      restoreHighlights();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Safety fallback in case observer never fires
  setTimeout(() => {
    observer.disconnect();
    console.log(
      '[Highlighter] Fallback timeout reached, attempting restore anyway.',
    );
    restoreHighlights();
  }, 5000);
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

function getSurroundingContext(range) {
  const CONTEXT_LENGTH = 30;

  const fullText = getVisibleText(); // <- now matches findRangeForText's method exactly
  const selectedText = range.toString();
  const index = fullText.indexOf(selectedText);

  if (index === -1) {
    return { before: '', after: '' };
  }

  const before = fullText.slice(Math.max(0, index - CONTEXT_LENGTH), index);
  const after = fullText.slice(
    index + selectedText.length,
    index + selectedText.length + CONTEXT_LENGTH,
  );

  return { before, after };
}

// Run on page load
// Run on page load
console.log(
  '[Highlighter] Script running. Body innerHTML length:',
  document.body.innerHTML.length,
);
console.log(
  '[Highlighter] Sample of visible paragraph text:',
  document.querySelector('p')?.textContent,
);
waitForContentThenRestore();
