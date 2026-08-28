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
  ensurePlaceholderStyle();

  const text = selection.toString().trim();
  const savedRange = range.cloneRange();

  highlightButton.innerHTML = '';
  highlightButton.style.gap = '0';
  highlightButton.style.background = '#3a3a3a';
  highlightButton.style.border = '1px solid rgba(255,255,255,0.22)';
  highlightButton.style.borderRadius = '9px';
  highlightButton.style.boxShadow = 'none';
  highlightButton.style.overflow = 'hidden';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Why did you highlight this? (optional)';
  input.className = 'substack-highlighter-input';
  input.style.border = 'none';
  input.style.outline = 'none';
  input.style.background = 'transparent';
  input.style.color = '#f5f5f5';
  input.style.padding = '9px 12px';
  input.style.fontSize = '13px';
  input.style.width = '240px';

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Save';
  confirmBtn.style.padding = '0 18px';
  confirmBtn.style.alignSelf = 'stretch';
  confirmBtn.style.background = '#ff6719';
  confirmBtn.style.color = '#fff';
  confirmBtn.style.border = 'none';
  confirmBtn.style.fontSize = '13px';
  confirmBtn.style.fontWeight = '600';
  confirmBtn.style.cursor = 'pointer';
  confirmBtn.style.whiteSpace = 'nowrap';

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
  btn.style.padding = '8px 14px';
  btn.style.background = '#ff6719';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '9px';
  btn.style.fontSize = '13px';
  btn.style.fontWeight = '600';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = 'none';
  btn.style.whiteSpace = 'nowrap';
}

function ensurePlaceholderStyle() {
  if (document.getElementById('substack-highlighter-style')) return;

  const style = document.createElement('style');
  style.id = 'substack-highlighter-style';
  style.textContent = `
    .substack-highlighter-input::placeholder {
      color: rgba(245, 245, 245, 0.5);
    }
  `;
  document.head.appendChild(style);
}
