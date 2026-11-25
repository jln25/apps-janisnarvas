/* ==========================================================================
   nav.js — shared sticky navigation for every page on this site
   Renders into <nav class="site-nav"></nav>, which must be the first element
   in <body> so it sticks to the top of the page.

   Lives in one file for the same reason the footer does: six pages, one
   source of truth. `data-root-prefix` lets pages inside a subfolder reach
   back up to the site root.

   Below 640px the links collapse behind a hamburger. The panel is a plain
   element toggled with `hidden`, and the button carries aria-expanded, so
   the control reports its own state rather than relying on the icon.
   ========================================================================== */

(() => {
  // Bumped with the rest of the site's assets.
  const ASSET_V = '3.7.0';

  const LINKS = [
    { label: 'Study Tracker', path: 'study-tracker/' },
    { label: 'Reading Notebook', path: 'reading-notebook/' },
    { label: 'BAMS Planner', path: 'bams-planner/' },
    { label: 'Copy Cat', path: 'copy-cat/' },
  ];

  /* Which link is the page we are on. Compared on the resolved pathname so a
     subfolder page matches its own entry rather than the home link. */
  function isCurrent(href) {
    const here = new URL(window.location.href);
    const target = new URL(href, window.location.href);
    const strip = (p) => p.replace(/index\.html$/, '').replace(/\/+$/, '/');
    return strip(here.pathname) === strip(target.pathname);
  }

  function buildLinks(prefix, id) {
    const list = document.createElement('ul');
    list.className = 'site-nav-links';
    list.id = id;

    LINKS.forEach((item) => {
      const href = `${prefix}${item.path}` || './';
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = item.label;
      if (isCurrent(href)) {
        a.className = 'is-current';
        // Tells a screen reader which page this is, not just which link looks lit.
        a.setAttribute('aria-current', 'page');
      }
      li.appendChild(a);
      list.appendChild(li);
    });

    return list;
  }

  function buildThemeToggle() {
    // theme.js binds any [data-theme-toggle] on click, so the nav's own
    // button needs no extra wiring.
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('data-theme-toggle', '');
    btn.setAttribute('aria-label', 'Switch theme');
    btn.innerHTML = '&#9790;';
    return btn;
  }

  function render() {
    document.querySelectorAll('.site-nav').forEach((nav, index) => {
      if (nav.dataset.rendered) return;
      nav.dataset.rendered = 'true';

      const prefix = nav.dataset.rootPrefix || '';
      const panelId = `site-nav-links-${index}`;

      const inner = document.createElement('div');
      inner.className = 'site-nav-inner';

      const brand = document.createElement('a');
      brand.className = 'site-nav-brand';
      brand.href = `${prefix}` || './';
      // The link carries the accessible name, so the mark itself is marked
      // decorative rather than announced twice.
      brand.setAttribute('aria-label', 'Home');
      const mark = document.createElement('img');
      mark.src = `${prefix}icons/favicon-512.png?v=${ASSET_V}`;
      mark.alt = '';
      mark.width = 32;
      mark.height = 32;
      brand.appendChild(mark);

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'site-nav-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', panelId);
      toggle.setAttribute('aria-label', 'Menu');
      toggle.innerHTML = '<span class="site-nav-bars" aria-hidden="true"></span>';

      const links = buildLinks(prefix, panelId);

      const actions = document.createElement('div');
      actions.className = 'site-nav-actions';
      actions.append(buildThemeToggle(), toggle);

      inner.append(brand, links, actions);
      nav.appendChild(inner);

      const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      };

      toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });

      // Escape closes it, and so does following a link — otherwise the panel
      // would still be open behind the next page on a same-page anchor.
      nav.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
          setOpen(false);
          toggle.focus();
        }
      });
      links.addEventListener('click', (e) => {
        if (e.target.closest('a')) setOpen(false);
      });

      // Widening past the breakpoint leaves the panel open but unstyled as a
      // panel; reset it so the desktop row is never in the "open" state.
      const wide = window.matchMedia('(min-width: 641px)');
      const sync = () => { if (wide.matches) setOpen(false); };
      wide.addEventListener ? wide.addEventListener('change', sync) : wide.addListener(sync);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
