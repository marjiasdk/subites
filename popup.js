function renderHighlights() {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const container = document.getElementById('highlights-container');
    const highlights = result.highlights;

    if (highlights.length === 0) {
      container.innerHTML =
        '<div class="empty-state">No highlights saved yet.</div>';
      return;
    }

    container.innerHTML = '';

    highlights
      .slice()
      .reverse()
      .forEach((h, reversedIndex) => {
        const actualIndex = highlights.length - 1 - reversedIndex;

        const card = document.createElement('div');
        card.className = 'highlight-card';

        const date = new Date(h.timestamp).toLocaleDateString();

        card.innerHTML = `
        <button class="delete-btn" data-index="${actualIndex}">x</button>
        <div class="highlight-text">${escapeHtml(h.text)}</div>
        ${h.note ? `<div class="highlight-note">"${escapeHtml(h.note)}"</div>` : ''}
        <div class="highlight-meta">
<a href="${h.url}" target="_blank">${escapeHtml(h.title)}</a> - ${date}
        </div>
      `;

        container.appendChild(card);
      });

    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        deleteHighlight(index);
      });
    });
  });
}

function deleteHighlight(index) {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights;
    const [removed] = highlights.splice(index, 1);
    chrome.storage.local.set({ highlights }, () => {
      renderHighlights();
    });

    if (removed) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: 'removeHighlight', highlightId: removed.timestamp },
          () => void chrome.runtime.lastError,
        );
      });
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

renderHighlights();

document.getElementById('export-btn').addEventListener('click', () => {
  window.open(chrome.runtime.getURL('highlights.html'), '_blank');
});
