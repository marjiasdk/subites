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
      console.log('[Highlighter] Saved to storage:', highlightData);
    });
  });

  if (highlightButton) {
    highlightButton.remove();
    highlightButton = null;
  }
}

function getSurroundingContext(range) {
  const CONTEXT_LENGTH = 30;

  const fullText = getVisibleText();
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
