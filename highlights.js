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
        <div class="highlight-text">${escapeHtml(h.text)}</div>
        ${h.note ? `<div class="highlight-note">"${escapeHtml(h.note)}"</div>` : ''}
        <div class="highlight-meta">
<a href="${h.url}" target="_blank">${escapeHtml(h.title)}</a> - ${date}
        </div>
      `;

        container.appendChild(card);
      });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

renderHighlights();
