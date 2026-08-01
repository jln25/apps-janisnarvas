/* ==========================================================================
   Reading Notebook — application logic
   No frameworks, no build step. Rich text fields use contenteditable +
   document.execCommand, which is deprecated but remains the simplest way
   to get a small formatting toolbar without a dependency.
   ========================================================================== */

const STORAGE_KEY = 'readingNotebook.notes';

/* Each long-form field, in the order they appear in the form/detail view. */
const RICH_FIELDS = [
  { key: 'bibliography', label: 'Info for Bibliography' },
  { key: 'method', label: 'Method / Respondents' },
  { key: 'findings', label: 'Key Findings / Notes' },
  { key: 'takeaway', label: 'How It Helps My Study / Takeaway' },
  { key: 'reflection', label: 'Reflection' },
  { key: 'gap', label: 'Gap / Limitation' },
];

/* ---------- State ---------- */

let notes = loadNotes();
let activeTagFilter = null; // string tag or null
let currentDetailId = null; // note currently shown in detail view

/* ---------- Persistence ---------- */

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load notes from localStorage', err);
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function generateId() {
  return 'note-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/* ---------- DOM references ---------- */

const els = {
  newNoteBtn: document.getElementById('new-note-btn'),
  searchInput: document.getElementById('search-input'),
  tagCloud: document.getElementById('tag-cloud'),
  clearTagFilterBtn: document.getElementById('clear-tag-filter-btn'),

  listView: document.getElementById('list-view'),
  activeFilterBanner: document.getElementById('active-filter-banner'),
  noteList: document.getElementById('note-list'),
  listEmptyMsg: document.getElementById('list-empty-msg'),

  detailView: document.getElementById('detail-view'),
  noteDetailContent: document.getElementById('note-detail-content'),
  backToListBtn: document.getElementById('back-to-list-btn'),
  exportNoteMdBtn: document.getElementById('export-note-md-btn'),
  editNoteBtn: document.getElementById('edit-note-btn'),
  deleteNoteBtn: document.getElementById('delete-note-btn'),

  formView: document.getElementById('form-view'),
  noteForm: document.getElementById('note-form'),
  noteId: document.getElementById('note-id'),
  noteTitle: document.getElementById('note-title'),
  noteTags: document.getElementById('note-tags'),
  richFieldsContainer: document.getElementById('rich-fields-container'),
  cancelFormBtn: document.getElementById('cancel-form-btn'),

  exportAllMdBtn: document.getElementById('export-all-md-btn'),
  exportAllCsvBtn: document.getElementById('export-all-csv-btn'),
};

/* ---------- Rich text field construction (toolbar + contenteditable) ---------- */

const TOOLBAR_BUTTONS = [
  { command: 'bold', label: 'B', title: 'Bold' },
  { command: 'italic', label: 'I', title: 'Italic' },
  { command: 'insertUnorderedList', label: '•', title: 'Bullet list' },
  { command: 'insertOrderedList', label: '1.', title: 'Numbered list' },
  { command: 'blockquote', label: '❝', title: 'Blockquote' },
];

function buildRichFields() {
  els.richFieldsContainer.innerHTML = '';
  RICH_FIELDS.forEach(({ key, label }) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'rich-field';

    const fieldLabel = document.createElement('label');
    fieldLabel.className = 'field-label';
    fieldLabel.textContent = label;

    const toolbar = document.createElement('div');
    toolbar.className = 'rich-field-toolbar';

    TOOLBAR_BUTTONS.forEach(({ command, label: btnLabel, title }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = btnLabel;
      btn.title = title;
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // keep focus in the editable div
        if (command === 'blockquote') {
          document.execCommand('formatBlock', false, 'blockquote');
        } else {
          document.execCommand(command, false, null);
        }
      });
      toolbar.appendChild(btn);
    });

    const editable = document.createElement('div');
    editable.className = 'rich-field-editable';
    editable.contentEditable = 'true';
    editable.dataset.field = key;

    // Clean pasted markup on the way in rather than waiting for save, so what
    // you see in the editor is what actually gets stored.
    editable.addEventListener('paste', (e) => {
      e.preventDefault();
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');
      if (html) {
        document.execCommand('insertHTML', false, sanitizeRichHtml(html));
      } else {
        document.execCommand('insertText', false, text);
      }
    });

    wrapper.append(fieldLabel, toolbar, editable);
    els.richFieldsContainer.appendChild(wrapper);
  });
}

/* ---------- Rich text sanitising ----------
   These fields hold HTML by design, and the normal workflow is pasting from
   article/journal pages — so untrusted markup lands here routinely. Only the
   formatting the toolbar can produce is kept; every attribute is dropped,
   which removes event handlers (onerror/onload), javascript: URLs, remote
   images that would leak the reader's IP, and pasted layout junk. */

const ALLOWED_TAGS = new Set(['P', 'BR', 'DIV', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'BLOCKQUOTE']);
/* Dropped along with their contents; unwrapping these would leak code as text. */
const DROP_ENTIRELY = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH']);

function sanitizeRichHtml(html) {
  // DOMParser builds an inert document: scripts don't run and images don't load.
  const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');

  const walk = (node) => {
    [...node.children].forEach((child) => {
      const tag = child.tagName.toUpperCase();
      if (DROP_ENTIRELY.has(tag)) {
        child.remove();
        return;
      }
      walk(child);
      if (ALLOWED_TAGS.has(tag)) {
        // Strip every attribute — nothing the toolbar produces needs one.
        [...child.attributes].forEach((attr) => child.removeAttribute(attr.name));
      } else {
        // Unknown but harmless wrapper (span, font, a…): keep the text, drop the tag.
        child.replaceWith(...child.childNodes);
      }
    });
  };
  walk(doc.body);

  return doc.body.innerHTML;
}

function getRichFieldValue(key) {
  const el = els.richFieldsContainer.querySelector(`[data-field="${key}"]`);
  return el ? sanitizeRichHtml(el.innerHTML) : '';
}

function setRichFieldValue(key, html) {
  const el = els.richFieldsContainer.querySelector(`[data-field="${key}"]`);
  if (el) el.innerHTML = sanitizeRichHtml(html);
}

/* ---------- Tag helpers ---------- */

function parseTags(raw) {
  return [...new Set(
    raw
      .split(/\s+/)
      // Tags are plain labels — strip anything that could be read as markup
      // so a tag can never turn into HTML wherever it's displayed or exported.
      .map((t) => t.replace(/^#/, '').replace(/[<>&"'`/\\]/g, '').trim().toLowerCase())
      .filter(Boolean)
  )];
}

function getAllTagCounts() {
  const counts = {};
  notes.forEach((note) => {
    note.tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return counts;
}

/* ---------- View switching ---------- */

function showView(viewName) {
  els.listView.hidden = viewName !== 'list';
  els.detailView.hidden = viewName !== 'detail';
  els.formView.hidden = viewName !== 'form';
}

/* ---------- Rendering: sidebar tag cloud ---------- */

function renderTagCloud() {
  const counts = getAllTagCounts();
  const tags = Object.keys(counts).sort();

  els.tagCloud.innerHTML = '';
  tags.forEach((tag) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'tag-pill' + (activeTagFilter === tag ? ' active' : '');
    // Built as text nodes, never innerHTML: tag text is user input and would
    // otherwise be parsed as markup.
    pill.append(`#${tag} `);
    const count = document.createElement('span');
    count.className = 'tag-pill-count';
    count.textContent = counts[tag];
    pill.appendChild(count);
    pill.addEventListener('click', () => {
      activeTagFilter = activeTagFilter === tag ? null : tag;
      renderTagCloud();
      renderListView();
    });
    els.tagCloud.appendChild(pill);
  });

  els.clearTagFilterBtn.hidden = !activeTagFilter;
}

els.clearTagFilterBtn.addEventListener('click', () => {
  activeTagFilter = null;
  renderTagCloud();
  renderListView();
});

/* ---------- Rendering: list view ---------- */

function getFilteredNotes() {
  const query = els.searchInput.value.trim().toLowerCase();
  return notes
    .filter((n) => !query || n.title.toLowerCase().includes(query))
    .filter((n) => !activeTagFilter || n.tags.includes(activeTagFilter))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function renderListView() {
  const filtered = getFilteredNotes();

  if (activeTagFilter) {
    els.activeFilterBanner.hidden = false;
    els.activeFilterBanner.textContent = `Showing notes tagged #${activeTagFilter}`;
  } else {
    els.activeFilterBanner.hidden = true;
  }

  els.noteList.innerHTML = '';
  els.listEmptyMsg.hidden = filtered.length !== 0;

  filtered.forEach((note) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.addEventListener('click', () => openDetailView(note.id));

    const title = document.createElement('h3');
    title.className = 'note-card-title';
    title.textContent = note.title;

    const snippet = document.createElement('p');
    snippet.className = 'note-card-snippet';
    snippet.textContent = stripHtmlToText(note.findings).slice(0, 180);

    const tagsRow = document.createElement('div');
    tagsRow.className = 'note-card-tags';
    note.tags.forEach((tag) => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.textContent = `#${tag}`;
      tagsRow.appendChild(pill);
    });

    card.append(title, snippet, tagsRow);
    els.noteList.appendChild(card);
  });
}

els.searchInput.addEventListener('input', renderListView);

els.newNoteBtn.addEventListener('click', () => openFormView(null));
els.backToListBtn.addEventListener('click', () => {
  showView('list');
  renderListView();
});

/* ---------- Rendering: detail view ---------- */

function openDetailView(noteId) {
  currentDetailId = noteId;
  const note = notes.find((n) => n.id === noteId);
  if (!note) return;

  const container = els.noteDetailContent;
  container.innerHTML = '';

  const h1 = document.createElement('h1');
  h1.textContent = note.title;

  const tagsRow = document.createElement('div');
  tagsRow.className = 'note-detail-tags';
  note.tags.forEach((tag) => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.textContent = `#${tag}`;
    tagsRow.appendChild(pill);
  });

  container.append(h1, tagsRow);

  RICH_FIELDS.forEach(({ key, label }) => {
    const section = document.createElement('div');
    section.className = 'note-detail-section';

    const h2 = document.createElement('h2');
    h2.textContent = label;

    const content = document.createElement('div');
    content.className = 'rich-content';
    // Sanitised again at render time so imported or pre-existing notes are
    // covered, not just what was saved through the editor.
    content.innerHTML = sanitizeRichHtml(note[key]) || '<p><em>Nothing recorded yet.</em></p>';

    section.append(h2, content);
    container.appendChild(section);
  });

  showView('detail');
}

els.editNoteBtn.addEventListener('click', () => {
  if (currentDetailId) openFormView(currentDetailId);
});

els.deleteNoteBtn.addEventListener('click', () => {
  if (!currentDetailId) return;
  if (!confirm('Delete this note? This cannot be undone.')) return;
  notes = notes.filter((n) => n.id !== currentDetailId);
  saveNotes();
  currentDetailId = null;
  renderTagCloud();
  showView('list');
  renderListView();
});

els.exportNoteMdBtn.addEventListener('click', () => {
  const note = notes.find((n) => n.id === currentDetailId);
  if (!note) return;
  downloadText(slugify(note.title) + '.md', noteToMarkdown(note));
});

/* ---------- Add / edit form ---------- */

function openFormView(noteId) {
  buildRichFields();
  const note = noteId ? notes.find((n) => n.id === noteId) : null;

  els.noteId.value = note ? note.id : '';
  els.noteTitle.value = note ? note.title : '';
  els.noteTags.value = note ? note.tags.map((t) => `#${t}`).join(' ') : '';

  RICH_FIELDS.forEach(({ key }) => setRichFieldValue(key, note ? note[key] : ''));

  showView('form');
  els.noteTitle.focus();
}

els.cancelFormBtn.addEventListener('click', () => {
  const id = els.noteId.value;
  showView(id ? 'detail' : 'list');
  if (!id) renderListView();
});

els.noteForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const id = els.noteId.value;
  const now = new Date().toISOString();

  const data = {
    title: els.noteTitle.value.trim(),
    tags: parseTags(els.noteTags.value),
    updatedAt: now,
  };
  RICH_FIELDS.forEach(({ key }) => { data[key] = getRichFieldValue(key); });

  if (!data.title) return;

  if (id) {
    const note = notes.find((n) => n.id === id);
    Object.assign(note, data);
    currentDetailId = id;
  } else {
    const newNote = { id: generateId(), createdAt: now, ...data };
    notes.push(newNote);
    currentDetailId = newNote.id;
  }

  saveNotes();
  renderTagCloud();
  openDetailView(currentDetailId);
});

/* ---------- Text conversion helpers ---------- */

/** Strips all HTML tags, collapsing block boundaries to single spaces — used for card snippets. */
function stripHtmlToText(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return (div.textContent || '').replace(/\s+/g, ' ').trim();
}

/** Converts contenteditable HTML output into Markdown, tailored to the toolbar's limited tag set. */
function htmlToMarkdown(html) {
  const container = document.createElement('div');
  container.innerHTML = html || '';
  return walkToMarkdown(container).replace(/\n{3,}/g, '\n\n').trim();
}

function walkToMarkdown(node) {
  let md = '';
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      md += child.textContent;
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const tag = child.tagName.toLowerCase();
    switch (tag) {
      case 'b':
      case 'strong':
        md += `**${walkToMarkdown(child)}**`;
        break;
      case 'i':
      case 'em':
        md += `*${walkToMarkdown(child)}*`;
        break;
      case 'ul':
        md += '\n' + Array.from(child.children)
          .map((li) => `- ${walkToMarkdown(li).trim()}`)
          .join('\n') + '\n';
        break;
      case 'ol':
        md += '\n' + Array.from(child.children)
          .map((li, i) => `${i + 1}. ${walkToMarkdown(li).trim()}`)
          .join('\n') + '\n';
        break;
      case 'blockquote':
        md += '\n' + walkToMarkdown(child).trim().split('\n').map((l) => `> ${l}`).join('\n') + '\n';
        break;
      case 'div':
      case 'p':
        md += walkToMarkdown(child) + '\n';
        break;
      case 'br':
        md += '\n';
        break;
      default:
        md += walkToMarkdown(child);
    }
  });
  return md;
}

function slugify(text) {
  return (text || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

function noteToMarkdown(note) {
  const lines = [];
  lines.push(`# ${note.title}`);
  lines.push('');
  if (note.tags.length) lines.push(note.tags.map((t) => `#${t}`).join(' '));
  lines.push('');

  RICH_FIELDS.forEach(({ key, label }) => {
    lines.push(`## ${label}`);
    lines.push(htmlToMarkdown(note[key]) || '_Nothing recorded yet._');
    lines.push('');
  });

  return lines.join('\n');
}

/* ---------- Downloads ---------- */

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Bulk export: all notes as .zip of Markdown files ---------- */

els.exportAllMdBtn.addEventListener('click', () => {
  if (notes.length === 0) { alert('No notes to export yet.'); return; }

  const usedNames = new Set();
  const files = notes.map((note) => {
    let name = slugify(note.title) + '.md';
    let i = 2;
    while (usedNames.has(name)) { name = `${slugify(note.title)}-${i++}.md`; }
    usedNames.add(name);
    return { name, content: noteToMarkdown(note) };
  });

  const zipBlob = createZip(files);
  triggerDownload(zipBlob, `reading-notebook-export-${todayISO()}.zip`);
});

/* ---------- Bulk export: all notes as a single CSV ---------- */

els.exportAllCsvBtn.addEventListener('click', () => {
  if (notes.length === 0) { alert('No notes to export yet.'); return; }

  const headers = ['Title', 'Tags', ...RICH_FIELDS.map((f) => f.label)];
  const rows = notes.map((note) => [
    note.title,
    note.tags.map((t) => `#${t}`).join(' '),
    ...RICH_FIELDS.map((f) => stripHtmlToText(note[f.key])),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
  downloadText(`reading-notebook-export-${todayISO()}.csv`, csv);
});

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------- Init ---------- */

renderTagCloud();
renderListView();
showView('list');
