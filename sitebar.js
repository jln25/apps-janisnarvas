/* ==========================================================================
   sitebar.js — shared footer for every page on this site
   Renders into <footer class="site-bar"></footer>.

   The whole footer lives here rather than in each page's markup, so the
   copyright, the contact icons and the licensing line only exist once.
   `data-root-prefix` lets pages inside a subfolder reach back up to
   license.html and the icons.
   ========================================================================== */

(() => {
  const CC_DEED = 'https://creativecommons.org/licenses/by/4.0/deed.en';
  // The browser URL for the repository, not the .git clone URL — that one is
  // for `git clone`, and only redirects here by GitHub's good grace.
  const REPO = 'https://github.com/jln25/apps-janisnarvas';
  const SITE = 'https://janisnarvas.com';

  // Bumped with the rest of the site's assets; see the README.
  const ASSET_V = '4.0.0';

  const SOCIALS = [
    { href: 'mailto:jlnarvas2@up.edu.ph', icon: 'email.png', label: 'Email' },
    { href: 'https://bsky.app/profile/janisnarvas.com', icon: 'bluesky.png', label: 'Bluesky' },
    { href: 'https://www.instagram.com/janisnarvas/', icon: 'instagram.png', label: 'Instagram' },
  ];

  function externalLink(href, text) {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = text;
    return a;
  }

  function buildCredit(prefix) {
    const row = document.createElement('div');
    row.className = 'site-bar-row';

    // Column 1 — who made this. Text rather than the logo: the nav already
    // carries the mark, and showing it twice a page earned nothing.
    const credit = document.createElement('p');
    credit.className = 'site-bar-credit';

    // One line, one flex item: the column stacks its children, so a bare
    // text node beside the link would put "Apps by" on its own row.
    const byline = document.createElement('span');
    const name = document.createElement('a');
    name.href = SITE;
    name.textContent = 'Janis Narvas';
    byline.append('Apps by ', name);
    credit.appendChild(byline);

    const place = document.createElement('span');
    place.className = 'site-bar-place';
    place.textContent = 'Designed in Los Baños, Laguna ♡';
    credit.appendChild(place);

    const list = document.createElement('ul');
    list.className = 'social';
    SOCIALS.forEach((s) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.href;
      // A mailto: has nowhere to open and no opener to disown.
      if (!s.href.startsWith('mailto:')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.setAttribute('aria-label', s.label);

      const img = document.createElement('img');
      img.src = `${prefix}icons/${s.icon}?v=${ASSET_V}`;
      img.width = 20;
      img.height = 20;
      // The link carries the accessible name, so the image is decorative.
      img.alt = '';
      a.appendChild(img);

      li.appendChild(a);
      list.appendChild(li);
    });

    // Column 3 — contact. The icons get a heading so they are announced
    // rather than three unexplained circles in the corner.
    const contact = document.createElement('div');
    contact.className = 'site-bar-contact';
    const sayHello = document.createElement('p');
    sayHello.className = 'site-bar-heading';
    sayHello.textContent = 'Say hello';
    contact.append(sayHello, list);

    // Column 2 (the licence terms) is appended by render(), which owns the
    // prefix those links need.
    row.append(credit, contact);
    return row;
  }

  /* Three short terms rather than a paragraph: the licensing splits cleanly
     in two (code, then writing and design) and the repository is a third
     thing again, so a list says it in fewer words than prose can. */
  function buildTerms(prefix) {
    const list = document.createElement('ul');
    list.className = 'site-bar-terms';

    const mit = document.createElement('a');
    mit.href = `${prefix}license.html`;
    mit.textContent = 'MIT License';

    [
      ['Code (except Copy Cat) under the ', mit],
      ['Writing and design under ', externalLink(CC_DEED, 'CC BY 4.0')],
      [externalLink(REPO, 'Source on GitHub')],
    ].forEach((parts) => {
      const li = document.createElement('li');
      li.append(...parts);
      list.appendChild(li);
    });

    return list;
  }

  function render() {
    document.querySelectorAll('.site-bar').forEach((bar) => {
      if (bar.dataset.rendered) return; // guard against double-invocation
      bar.dataset.rendered = 'true';

      // Pages one level down (the apps) need "../" to reach the root.
      const prefix = bar.dataset.rootPrefix || '';

      // One row of three columns: identity, licence, contact. The terms are
      // built here because they need the prefix, then slotted between the
      // other two rather than stacked underneath them.
      const row = buildCredit(prefix);
      const terms = document.createElement('div');
      terms.className = 'site-bar-licence';
      const heading = document.createElement('p');
      heading.className = 'site-bar-heading';
      heading.textContent = 'Licence';
      terms.append(heading, buildTerms(prefix));
      row.insertBefore(terms, row.lastElementChild);

      const inner = document.createElement('div');
      inner.className = 'site-bar-inner';
      inner.append(row);
      bar.appendChild(inner);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
