# Substack Highlighter

A Chrome extension that lets you highlight text on Substack articles, attach a quick note to it, and come back to everything you've saved later.

## Why this exists

I read a lot of Substack articles and wished there was a way to highlight parts and look back on them. This tool highlights text, allows you to add a note, and let's you save them in a local page.

## What it does

- Select any text on a Substack article and a "Save highlight" button pops up next to it
- Click it, optionally type a short note, hit Save
- The text stays visually highlighted on the page, even after you reload
- Click the extension icon to see everything you've saved, most recent first, each one linking back to the article it came from
- Delete a highlight from that popup and it disappears from the page immediately, no reload needed
- Open your highlights as a full page (instead of a cramped popup) with one click

## Installing it

This isn't on the Chrome Web Store, so you load it manually:

1. Clone the repo
   ```bash
   git clone https://github.com/marjiasdk/subites.git
   ```
2. Open `chrome://extensions` in Chrome
3. Turn on **Developer mode** (top right corner)
4. Click **Load unpacked** and select the folder you just cloned
5. Go to any article on a `substack.com` domain and try selecting some text

If you make changes to the code, go back to `chrome://extensions` and hit the reload icon on the extension card. Any Substack tabs you already had open need a manual refresh too, otherwise they'll keep running the old version of the content script and throw an "Extension context invalidated" error the moment they try to save something.

## Using it

**Highlighting:** select text on an article. A small button appears near your selection. Click it, and it turns into a text field where you can add a note explaining why you highlighted it. Notes are optional, just hit Save or press Enter.

**Viewing your highlights:** click the extension icon in your toolbar. You'll see a list of everything you've saved, newest first. Each card shows the highlighted text, your note if you left one, and a link back to the original article.

**Deleting:** click the small x on any highlight card in the popup. It's removed from storage right away, and if you're currently on the article that highlight came from, the yellow mark disappears from the page too.

**Full highlights page:** click "View Highlights" in the popup to open your highlights in a proper browser tab instead of the small popup window. Useful if you've got a lot saved and want to actually read through them.

## How it's built

Plain JavaScript, no frameworks or build step. Everything runs either as a content script injected into Substack pages, or as the popup/extension pages.

```
manifest.json       extension config, permissions, which scripts run where
popup.html/js        the toolbar popup: lists highlights, handles delete
highlights.html/js   the full-page view opened from the popup
content/
  dom-utils.js        wraps selected text in <mark> tags, and unwraps them on delete
  ui.js               the floating "Save highlight" button and note input
  storage.js          saves a new highlight to chrome.storage.local
  restore.js          re-finds and re-highlights saved text when a page loads
  main.js             wires everything together, listens for delete messages
```

Highlights are stored in `chrome.storage.local`, keyed under a single `highlights` array. Each entry has the highlighted text, your note, the surrounding text (used to relocate it on reload), the article URL and title, and a timestamp that also doubles as its unique ID.

Nothing leaves your machine. There's no server, no account, no analytics.

## Permissions it asks for

- `storage`, to save your highlights locally
- `activeTab`, to talk to the Substack tab you're currently on (used when you delete a highlight from the popup, so the page can remove the mark right away)

## Known limitations

- Re-finding highlighted text on reload works by matching the saved text plus a bit of surrounding context. If an article gets edited after you highlighted something, or the surrounding text changes enough, the highlight might not reappear (your saved note and text are still safe in storage either way, it just won't be visually marked on the page).
- Everything is stored locally on your machine. If you switch computers or reinstall Chrome, your highlights don't come with you. No cloud sync yet.
- Only works on `substack.com` domains, not custom domains that Substack publications sometimes use.

## Ideas for later

- Cloud sync so highlights follow you across devices
- Search and filter in the highlights view
- Markdown export
- Support for custom Substack domains
