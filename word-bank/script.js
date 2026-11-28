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

  const GROUP_LABEL = { mood: 'Mood', industry: 'Industry', context: 'Page section' };
  const WORD_KINDS = [
    ['adjectives', 'Adjectives'],
    ['verbs', 'Verbs'],
    ['nouns', 'Nouns'],
    ['phrases', 'Phrases'],
  ];

  // One dropdown per slot. Results follow this order.
  const SLOTS = ['mood1', 'mood2', 'industry', 'context'];
  const SLOT_GROUP = { mood1: 'mood', mood2: 'mood', industry: 'industry', context: 'context' };

  const $ = (id) => document.getElementById(id);
  const els = {
    form: $('search-form'),
    input: $('search-input'),
    suggest: $('search-suggest'),
    selects: Object.fromEntries(SLOTS.map((s) => [s, $(`pick-${s}`)])),
    mood2Field: $('mood2-field'),
    addMood: $('add-mood-btn'),
    clear: $('clear-btn'),
    results: $('results'),
    noMatch: $('no-match'),
    noMatchText: $('no-match-text'),
    dmBtn: $('datamuse-btn'),
    dmResults: $('datamuse-results'),
    toast: $('toast'),
  };

  /* ---------- State ----------
     Picks survive a reload and can be bookmarked: ?w=luxury,food,pricing-packaging.
     Each id goes to the first free slot of its group. */

  const picks = { mood1: '', mood2: '', industry: '', context: '' };
  let showMood2 = false;

  new Set((new URLSearchParams(location.search).get('w') || '').split(',')).forEach((id) => {
    const cat = byId.get(id);
    if (!cat) return;
    const slot = SLOTS.find((s) => SLOT_GROUP[s] === cat.group && !picks[s]);
    if (slot) picks[slot] = id;
  });
  showMood2 = Boolean(picks.mood2);

  function pickedIds() {
    return [...new Set(SLOTS.map((s) => picks[s]).filter(Boolean))];
  }

  function syncUrl() {
    const url = new URL(location.href);
    const ids = pickedIds();
    if (ids.length) url.searchParams.set('w', ids.join(','));
    else url.searchParams.delete('w');
    history.replaceState(null, '', url);
  }

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

  /* ---------- Dropdowns ---------- */

  function option(cat) {
    return el('option', { value: cat.id, text: cat.name });
  }

  function fillSelects() {
    const of = (group) => WORDS.filter((c) => c.group === group);
    const moods = of('mood');

    ['mood1', 'mood2'].forEach((slot) => {
      els.selects[slot].replaceChildren(
        el('option', { value: '', text: slot === 'mood1' ? 'Any mood' : 'No second mood' }),
        ...moods.map(option),
      );
    });

    // Professional services get their own labelled part of the list.
    const industries = of('industry');
    els.selects.industry.replaceChildren(
      el('option', { value: '', text: 'Any industry' }),
      el('optgroup', { label: 'Professional services' },
        industries.filter((c) => c.parent === 'professional-services').map(option)),
      el('optgroup', { label: 'Other industries' },
        industries.filter((c) => c.parent !== 'professional-services').map(option)),
    );

    els.selects.context.replaceChildren(
      el('option', { value: '', text: 'Any page section' }),
      ...of('context').map(option),
    );

    // Typing suggestions: every name, plus the other words each answers to.
    const seen = new Set();
    els.suggest.replaceChildren(...WORDS.flatMap((c) => [c.name, ...(c.aliases || [])]
      .filter((term) => !seen.has(term.toLowerCase()) && seen.add(term.toLowerCase()))
      .map((term) => el('option', { value: term }))));
  }

  /* ---------- Search ---------- */

  /** The category a search means, or null. An exact name or alias wins;
      otherwise the one matching the most (and longest) query words, so
      "pricing page" lands on Pricing rather than on every "page". */
  function resolve(query) {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const terms = (c) => [c.name, c.id, ...(c.aliases || [])].map((t) => t.toLowerCase());

    const exact = WORDS.find((c) => terms(c).includes(q));
    if (exact) return exact;

    const words = q.split(/\s+/).filter((w) => w.length >= 3);
    let best = null;
    let bestScore = 0;
    WORDS.forEach((c) => {
      const hay = terms(c).join(' ');
      const score = hay.includes(q) ? 100 : words.reduce((s, w) => s + (hay.includes(w) ? w.length : 0), 0);
      if (score > bestScore) { best = c; bestScore = score; }
    });
    return best;
  }

  /** Puts a category in the right dropdown. A mood fills the first empty mood
      slot, else replaces the last one showing. */
  function place(cat) {
    let slot = cat.group === 'industry' ? 'industry' : cat.group === 'context' ? 'context' : null;
    if (!slot) {
      if (picks.mood1 === cat.id || picks.mood2 === cat.id) return;
      if (!picks.mood1) slot = 'mood1';
      else if (showMood2 && !picks.mood2) slot = 'mood2';
      else slot = showMood2 ? 'mood2' : 'mood1';
    }
    picks[slot] = cat.id;
    toast(`${GROUP_LABEL[cat.group]}: ${cat.name}`);
  }

  /* ---------- Rendering ---------- */

  function renderPickers() {
    SLOTS.forEach((s) => { els.selects[s].value = picks[s]; });
    els.mood2Field.hidden = !showMood2;
    els.addMood.hidden = showMood2 || !picks.mood1;
    els.clear.hidden = pickedIds().length === 0;
  }

  function renderResults() {
    const cats = pickedIds().map((id) => byId.get(id));

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

    // Two cards side by side at most: four picks would make columns too narrow.
    els.results.style.setProperty('--cols', Math.min(Math.max(cats.length, 1), 2));
    els.results.replaceChildren(...nodes);
  }

  function render() {
    renderPickers();
    renderResults();
    syncUrl();
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

  // Enter, or picking a suggestion, sets the matching dropdown. No match
  // offers Datamuse instead.
  function search() {
    const term = els.input.value.trim();
    if (!term) return;
    const cat = resolve(term);
    els.dmResults.replaceChildren();
    if (cat) {
      els.noMatch.hidden = true;
      els.input.value = '';
      place(cat);
      render();
    } else {
      els.noMatch.hidden = false;
      els.noMatchText.textContent = `No category for “${term}” yet. Datamuse can suggest related words, though they're rougher than the lists here.`;
    }
  }

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    search();
  });

  // A suggestion chosen from the list fires `input` with an exact value;
  // ordinary typing only hides an old "no match" message.
  els.input.addEventListener('input', (e) => {
    const fromList = e.inputType === 'insertReplacementText' || !e.inputType;
    const q = els.input.value.trim().toLowerCase();
    const isTerm = WORDS.some((c) => [c.name, ...(c.aliases || [])].some((t) => t.toLowerCase() === q));
    if (fromList && isTerm) {
      search();
      return;
    }
    els.noMatch.hidden = true;
  });

  els.dmBtn.addEventListener('click', () => lookUp(els.input.value.trim()));

  SLOTS.forEach((slot) => {
    els.selects[slot].addEventListener('change', () => {
      picks[slot] = els.selects[slot].value;
      if (slot === 'mood2' && !picks.mood2) showMood2 = false;
      // Clearing the first mood moves the second one up.
      if (slot === 'mood1' && !picks.mood1 && picks.mood2) {
        picks.mood1 = picks.mood2;
        picks.mood2 = '';
        showMood2 = false;
      }
      render();
    });
  });

  els.addMood.addEventListener('click', () => {
    showMood2 = true;
    renderPickers();
    els.selects.mood2.focus();
  });

  els.clear.addEventListener('click', () => {
    SLOTS.forEach((s) => { picks[s] = ''; });
    showMood2 = false;
    render();
    els.selects.mood1.focus();
  });

  // One listener copies any word chip on the page, Datamuse ones included.
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-copy]');
    if (chip) copy(chip.dataset.copy);
  });

  /* ---------- Sticky bar ----------
     The search and dropdowns pin under the nav, whose height changes with
     the screen width (and when its menu opens), so it is measured rather
     than guessed. */
  const nav = document.querySelector('.site-nav');
  const root = document.documentElement;
  const measure = () => {
    root.style.setProperty('--nav-h', `${nav ? nav.offsetHeight : 0}px`);
    root.style.setProperty('--search-h', `${els.form.offsetHeight}px`);
  };
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(measure);
    if (nav) ro.observe(nav);
    ro.observe(els.form);
  }
  measure();

  fillSelects();
  render();
})();
