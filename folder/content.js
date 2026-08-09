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

  highlightButton = document.createElement('button');
  highlightButton.textContent = 'Save highlight';
  highlightButton.style.position = 'absolute';
  highlightButton.style.top = `${window.scrollY + rect.top - 40}px`;
  highlightButton.style.left = `${window.scrollX + rect.left}px`;
  highlightButton.style.zIndex = '999999';
  highlightButton.style.padding = '6px 10px';
  highlightButton.style.background = '#ff6719';
  highlightButton.style.color = '#fff';
  highlightButton.style.border = 'none';
  highlightButton.style.borderRadius = '6px';
  highlightButton.style.fontSize = '13px';
  highlightButton.style.cursor = 'pointer';
  highlightButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';

  highlightButton.addEventListener('click', (e) => {
    console.log('BUTTON WAS CLICKED');
    e.stopPropagation();

    const text = selection.toString().trim();
    const range = selection.getRangeAt(0).cloneRange(); // clone before it gets cleared

    highlightRange(range);

    console.log('Saved highlight:', text);
    highlightButton.remove();
    highlightButton = null;
  });

  document.body.appendChild(highlightButton);
}

function highlightRange(range) {
  const mark = document.createElement('mark');
  mark.style.backgroundColor = '#ffe08a';
  mark.style.padding = '0 1px';
  mark.className = 'substack-highlighter-mark';

  try {
    // Simple case: selection doesn't cross element boundaries
    range.surroundContents(mark);
  } catch (err) {
    // Selection spans multiple nodes — fallback: extract and re-wrap
    const contents = range.extractContents();
    mark.appendChild(contents);
    range.insertNode(mark);
  }
}
