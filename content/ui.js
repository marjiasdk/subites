let highlightButton = null;

function showSaveButton(selection, event) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  let containerEl = range.startContainer;
  if (containerEl.nodeType === Node.TEXT_NODE) {
    containerEl = containerEl.parentElement;
  }
  const articleBlock = containerEl.closest('p, div, article') || containerEl;
  const articleRect = articleBlock.getBoundingClientRect();

  highlightButton = document.createElement('div');
  highlightButton.style.position = 'absolute';
  highlightButton.style.top = `${window.scrollY + rect.top}px`;
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

function styleButton(btn) {
  btn.style.padding = '7px 12px';
  btn.style.background = '#ff6719';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '20px';
  btn.style.fontSize = '13px';
  btn.style.fontWeight = '500';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
  btn.style.whiteSpace = 'nowrap';
}
