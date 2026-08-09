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

  highlightButton = document.createElement('div');
  highlightButton.style.position = 'absolute';
  highlightButton.style.top = `${window.scrollY + rect.top - 40}px`;
  highlightButton.style.left = `${window.scrollX + rect.left}px`;
  highlightButton.style.zIndex = '999999';
  highlightButton.style.display = 'flex';
  highlightButton.style.gap = '4px';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save highlight';
  styleButton(saveBtn);

  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showNoteInput(selection, range);
  });

  highlightButton.appendChild(saveBtn);
  document.body.appendChild(highlightButton);
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

  const highlightData = {
    text,
    note,
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

function styleButton(btn) {
  btn.style.padding = '6px 10px';
  btn.style.background = '#ff6719';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '6px';
  btn.style.fontSize = '13px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
}

function highlightRange(range) {
  const mark = document.createElement('mark');
  mark.style.backgroundColor = '#ffe08a';
  mark.style.padding = '0 1px';
  mark.className = 'substack-highlighter-mark';

  try {
    range.surroundContents(mark);
  } catch (err) {
    const contents = range.extractContents();
    mark.appendChild(contents);
    range.insertNode(mark);
  }
}
