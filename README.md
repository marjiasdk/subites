# Substack Highlighter

A Chrome extension for highlighting text on Substack articles and saving it with your own notes.

## Features

- **Select and save** — highlight any text on a Substack article and save it with one click
- **Add context** — attach a short note explaining why the highlight mattered to you
- **Visual highlighting** — selected text is marked directly on the page for the current session
- **Browse your highlights** — a popup viewer lists everything you've saved, most recent first, with links back to the source article
- **Export** — download all your highlights as a dated JSON file at any time

## Why

Reading a lot of Substack and losing track of what stuck with me — and why — was the problem this solves. 

## Installation (local/unpacked)

1. Clone this repo
```bash
   git clone https://github.com/marjiasdk/substack-highlighter.git
```
2. Go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the cloned folder
5. Visit any Substack article and start highlighting

## Tech

- Vanilla JavaScript (Manifest V3 Chrome extension)
- `chrome.storage.local` for persistence
- No external dependencies

## Known limitations

- Highlights are visual-only for the current page session — they don't currently persist across reloads on the page itself (your saved *data* does persist, just not the on-page visual mark). Re-anchoring highlights across reloads is a harder problem I may tackle in a future version.
- Local storage only — no sync across devices yet.

## Roadmap ideas

- Persistent on-page highlight anchoring across reloads
- Cloud sync (Supabase) for cross-device access
- Search/filter in the popup viewer
- Markdown export option
