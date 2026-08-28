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

waitForContentThenRestore();

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'removeHighlight') {
    document
      .querySelectorAll(
        `.substack-highlighter-mark[data-highlight-id="${message.highlightId}"]`,
      )
      .forEach(unwrapMark);
  }
});
