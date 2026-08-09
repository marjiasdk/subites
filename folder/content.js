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
    console.log('Save clicked for:', selection.toString().trim());
    highlightButton.remove();
    highlightButton = null;
  });

  document.body.appendChild(highlightButton);
}
