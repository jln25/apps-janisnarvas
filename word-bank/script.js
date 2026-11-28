/* ==========================================================================
   Word Bank
   The word lists live in data/*.js, which push into window.WORDS. This file
   only searches, shows and copies them. Nothing is stored or sent anywhere,
   except a search that matches no category, which the visitor can choose to
   look up on Datamuse (a free word API that needs no key).
   ========================================================================== */

(() => {
  const WORDS = window.WORDS || [];
  const byId = new Map(WORDS.map((c) => [c.id, c]));
  const MAX_PICKS = 3;

  const GROUPS = [
    { key: 'mood', title: 'Moods' },
    { key: 'industry', title: 'Industries' },
    { key: 'context', title: 'Page sections' },
  ];
  const GROUP_LABEL = { mood: 'Mood', industry: 'Industry', context: 'Page section' };
  const WORD_KINDS = [
    ['adjectives', 'Adjectives'],
    ['verbs', 'Verbs'],
    ['nouns', 'Nouns'],
    ['phrases', 'Phrases'],
  ];

  const $ = (id) => document.getElementById(id);
  const els = {
    form: $('search-form'),
    input: $('search-input'),
    selected: $('selected'),
    selectedChips: $('selected-chips'),
    clear: $('clear-btn'),
    results: $('results'),
    browse: $('browse'),
    noMatch: $('no-match'),
    noMatchText: $('no-match-text'),
    dmBtn: $('datamuse-btn'),
    dmResults: $('datamuse-results'),
    toast: $('toast'),
  };

  // Picks survive a reload and can be bookmarked: ?w=luxury,food
  let picks = (new URLSearchParams(location.search).get('w') || '')
    .split(',').filter((id) => byId.has(id)).slice(0, MAX_PICKS);

  /* ---------- Helpers ---------- */

  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    });
    children.forEach((c) => c && node.appendChild(c));
    return node;
  }

  let toastTimer;
  function toast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, 1800);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers, or a page opened from disk without clipboard access.
      const ta = el('textarea', { 'aria-hidden': 'true' });
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast(`Copied “${text}”`);
  }

  function wordChip(word, shared) {
    return el('li', {}, [
      el('button', {
        type: 'button',
        class: 'word-chip' + (shared ? ' is-shared' : ''),
        'data-copy': word,
        title: 'Copy',
        text: word,
      }),
    ]);
  }

  /* ---------- Search ---------- */

  function matches(cat, query) {
    if (!query) return true;
    const hay = [cat.name, cat.id, ...(cat.aliases || [])].join(' ').toLowerCase();
    if (hay.includes(query)) return true;
    // "pricing page" still finds Pricing: any longer query word will do.
    return query.split(/\s+/).some((w) => w.length >= 4 && hay.includes(w));
  }

  function currentMatches() {
    const q = els.input.value.trim().toLowerCase();
    return WORDS.filter((c) => matches(c, q));
  }

  /* ---------- Selection ---------- */

  function toggle(id) {
    if (picks.includes(id)) {
      picks = picks.filter((p) => p !== id);
    } else if (picks.length >= MAX_PICKS) {
      toast('You can pick up to three. Remove one first.');
      return;
    } else {
      picks.push(id);
    }
    const url = new URL(location.href);
    if (picks.length) url.searchParams.set('w', picks.join(','));
    else url.searchParams.delete('w');
    history.replaceState(null, '', url);
    render();
  }

  /* ---------- Rendering ---------- */

  function renderSelected() {
    els.selected.hidden = picks.length === 0;
    els.selectedChips.replaceChildren(...picks.map((id) => {
      const cat = byId.get(id);
      const remove = el('button', { type: 'button', 'aria-label': `Remove ${cat.name}`, text: '×' });
      remove.addEventListener('click', () => toggle(id));
      return el('span', { class: 'sel-chip' }, [
        el('span', {}, [
          el('span', { class: 'sel-chip-group', text: `${GROUP_LABEL[cat.group]}: ` }),
          document.createTextNode(cat.name),
        ]),
        remove,
      ]);
    }));
  }

  function renderResults() {
    const cats = picks.map((id) => byId.get(id));

    // Words that turn up in more than one pick are the heart of a blend.
    const counts = new Map();
    cats.forEach((cat) => {
      const seen = new Set();
      WORD_KINDS.forEach(([kind]) => (cat[kind] || []).forEach((w) => seen.add(w.toLowerCase())));
      seen.forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
    });
    const isShared = (w) => cats.length > 1 && counts.get(w.toLowerCase()) > 1;

    const cards = cats.map((cat) => {
      const sections = WORD_KINDS
        .filter(([kind]) => (cat[kind] || []).length)
        .map(([kind, label]) => el('section', { class: 'word-section' }, [
          el('h3', { text: label }),
          el('ul', { class: 'chip-row' }, cat[kind].map((w) => wordChip(w, isShared(w)))),
        ]));
      return el('article', { class: 'card' }, [
        el('header', {}, [
          el('p', { class: 'card-kicker', text: GROUP_LABEL[cat.group] }),
          el('h2', { text: cat.name }),
        ]),
        ...sections,
      ]);
    });

    const nodes = [...cards];

    if (cats.length > 1 && [...counts.values()].some((n) => n > 1)) {
      nodes.unshift(el('p', {
        class: 'shared-note',
        text: 'Underlined words appear in more than one of your picks.',
      }));
    }

    // One combined avoid list, without repeats.
    const avoid = new Map();
    cats.forEach((cat) => (cat.avoid || []).forEach((a) => {
      const item = typeof a === 'string' ? { word: a } : a;
      const key = item.word.toLowerCase();
      if (!avoid.has(key)) avoid.set(key, item);
    }));
    if (avoid.size) {
      nodes.push(el('article', { class: 'card card-avoid' }, [
        el('header', {}, [
          el('p', { class: 'card-kicker', text: 'Steer clear of' }),
          el('h2', { text: 'Words to avoid' }),
        ]),
        el('ul', { class: 'avoid-list' }, [...avoid.values()].map((a) => el('li', {}, [
          el('span', { class: 'avoid-word', text: a.word }),
          a.reason ? el('span', { class: 'avoid-reason', text: ` — ${a.reason}` }) : null,
        ]))),
      ]));
    }

    els.results.style.setProperty('--cols', Math.max(cats.length, 1));
    els.results.replaceChildren(...nodes);
  }

  function catChip(cat) {
    const btn = el('button', {
      type: 'button',
      class: 'cat-chip',
      'aria-pressed': String(picks.includes(cat.id)),
      text: cat.name,
    });
    btn.addEventListener('click', () => toggle(cat.id));
    return el('li', {}, [btn]);
  }

  function renderBrowse() {
    const shown = currentMatches();
    const q = els.input.value.trim();

    const groups = GROUPS.map(({ key, title }) => {
      const cats = shown.filter((c) => c.group === key);
      if (!cats.length) return null;

      // Industries split professional services out into its own list.
      const subs = key === 'industry'
        ? [
          ['Professional services', cats.filter((c) => c.parent === 'professional-services')],
          ['Other industries', cats.filter((c) => c.parent !== 'professional-services')],
        ].filter(([, list]) => list.length)
        : [[null, cats]];

      return el('section', { class: 'browse-group' }, [
        el('h2', { text: title }),
        ...subs.map(([subTitle, list]) => el('div', { class: 'browse-sub' }, [
          subTitle ? el('h3', { text: subTitle }) : null,
          el('ul', { class: 'chip-row' }, list.map(catChip)),
        ])),
      ]);
    }).filter(Boolean);

    els.browse.replaceChildren(...groups);
    els.browse.hidden = groups.length === 0;

    els.noMatch.hidden = shown.length > 0;
    if (!shown.length) {
      els.noMatchText.textContent = `No category for “${q}” yet. Datamuse can suggest related words, though they're rougher than the lists here.`;
    }
  }

  function render() {
    renderSelected();
    renderResults();
    renderBrowse();
  }

  /* ---------- Datamuse fallback ---------- */

  async function lookUp(term) {
    const enc = encodeURIComponent(term);
    els.dmResults.replaceChildren(el('p', { class: 'dm-status', text: 'Looking up…' }));
    try {
      const urls = [
        `https://api.datamuse.com/words?ml=${enc}&md=p&max=80`,      // means like
        `https://api.datamuse.com/words?rel_jjb=${enc}&md=p&max=40`, // adjectives used with it
      ];
      const lists = await Promise.all(urls.map((u) => fetch(u).then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })));

      const buckets = { adjectives: [], verbs: [], nouns: [], other: [] };
      const seen = new Set();
      lists.flat().forEach(({ word, tags = [] }) => {
        if (seen.has(word)) return;
        seen.add(word);
        if (tags.includes('adj')) buckets.adjectives.push(word);
        else if (tags.includes('v')) buckets.verbs.push(word);
        else if (tags.includes('n')) buckets.nouns.push(word);
        else buckets.other.push(word);
      });

      if (!seen.size) {
        els.dmResults.replaceChildren(el('p', { class: 'dm-status', text: `Datamuse has nothing for “${term}” either.` }));
        return;
      }

      const labels = { adjectives: 'Adjectives', verbs: 'Verbs', nouns: 'Nouns', other: 'Other' };
      els.dmResults.replaceChildren(el('article', { class: 'card' }, [
        el('header', {}, [
          el('p', { class: 'card-kicker', text: 'Rough suggestions from Datamuse' }),
          el('h2', { text: term }),
        ]),
        ...Object.entries(buckets).filter(([, list]) => list.length).map(([kind, list]) =>
          el('section', { class: 'word-section' }, [
            el('h3', { text: labels[kind] }),
            el('ul', { class: 'chip-row' }, list.map((w) => wordChip(w, false))),
          ])),
      ]));
    } catch {
      els.dmResults.replaceChildren(el('p', { class: 'dm-status', text: 'Couldn’t reach Datamuse. Check your connection and try again.' }));
    }
  }

  /* ---------- Events ---------- */

  els.input.addEventListener('input', () => {
    els.dmResults.replaceChildren();
    renderBrowse();
  });

  // Enter picks the only match, or looks the term up when nothing matches.
  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = els.input.value.trim();
    if (!term) return;
    const shown = currentMatches();
    if (shown.length === 1) {
      if (!picks.includes(shown[0].id)) toggle(shown[0].id);
      els.input.value = '';
      renderBrowse();
    } else if (shown.length === 0) {
      lookUp(term);
    }
  });

  els.dmBtn.addEventListener('click', () => lookUp(els.input.value.trim()));

  els.clear.addEventListener('click', () => {
    [...picks].forEach(toggle);
    els.input.focus();
  });

  // One listener copies any word chip on the page, Datamuse ones included.
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-copy]');
    if (chip) copy(chip.dataset.copy);
  });

  render();
})();
